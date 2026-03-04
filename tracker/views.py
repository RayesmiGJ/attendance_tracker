from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from .models import Attendance, WorkFromHome, Leave
from datetime import date, datetime, timedelta
from django.utils.dateparse import parse_date

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        print(f"Trying login: {username}")  
        user = authenticate(request, username=username, password=password)
        print(f"User object: {user}")  
        if user is not None:
            login(request, user)
            print(f"Login successful, redirecting...")  
            if username == 'ray':  
                return redirect('admin_dashboard')
            else:
                return redirect('user_dashboard')
        else:
            print("Authentication failed")  
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

@login_required
def admin_dashboard(request):
    return render(request, 'admin_dashboard.html', {'user': request.user})

@login_required
def user_dashboard(request):
    return render(request, 'user_dashboard.html', {'user': request.user})

@login_required
def mark_attendance(request):
    today = date.today()
    
    # Check WFH
    wfh = WorkFromHome.objects.filter(
        user=request.user,
        from_date__lte=today,
        to_date__gte=today
    ).exists()
    
    # Check Leave
    leave = Leave.objects.filter(user=request.user, date=today).exists()  
    if wfh:
        return render(request, 'attendance.html', {'error': 'Cannot mark - You are on Work From Home today'}) 
    if leave:
        return render(request, 'attendance.html', {'error': 'Cannot mark - You are on Leave today'})
    if Attendance.objects.filter(user=request.user, date=today).exists():
        return render(request, 'attendance.html', {'error': 'Already marked today'})  
    if request.method == 'POST':
        Attendance.objects.create(user=request.user, date=today)
        if request.user.username == 'ray':
            return redirect('admin_dashboard')
        else:
            return redirect('user_dashboard')
    return render(request, 'attendance.html', {'today': today})

@login_required
def view_attendance(request):
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    
    attendance_records = Attendance.objects.filter(user=request.user)
    leave_records = Leave.objects.filter(user=request.user)
    wfh_records = WorkFromHome.objects.filter(user=request.user)
    
    if from_date:
        from_date_obj = parse_date(from_date)
        attendance_records = attendance_records.filter(date__gte=from_date_obj)
        leave_records = leave_records.filter(date__gte=from_date_obj)
        wfh_records = wfh_records.filter(from_date__gte=from_date_obj) | wfh_records.filter(to_date__gte=from_date_obj)
    if to_date:
        to_date_obj = parse_date(to_date)
        attendance_records = attendance_records.filter(date__lte=to_date_obj)
        leave_records = leave_records.filter(date__lte=to_date_obj)
        wfh_records = wfh_records.filter(from_date__lte=to_date_obj) | wfh_records.filter(to_date__lte=to_date_obj)   
    attendance_records = attendance_records.values('date')
    leave_records = leave_records.values('date', 'leave_type', 'reason')
    wfh_records = wfh_records.values('from_date', 'to_date')   
    wfh_dates = []
    wfh_details = {}
    for wfh in wfh_records:
        current = wfh['from_date']
        while current <= wfh['to_date']:
            if from_date and to_date:
                if from_date_obj <= current <= to_date_obj:
                    wfh_dates.append(current)
                    wfh_details[str(current)] = f"From {wfh['from_date']} to {wfh['to_date']}"
            else:
                wfh_dates.append(current)
                wfh_details[str(current)] = f"From {wfh['from_date']} to {wfh['to_date']}"
            current += timedelta(days=1)    
    all_records = []      
    for record in attendance_records:
        all_records.append({
            'date': record['date'],
            'status': 'Present',
            'leave_type': '',
            'reason': '',
            'from_date': '',
            'to_date': ''
        })   
    for record in leave_records:
        all_records.append({
            'date': record['date'],
            'status': 'Leave',
            'leave_type': record['leave_type'],
            'reason': record['reason'],
            'from_date': '',
            'to_date': ''
        })
    for date in set(wfh_dates): 
        existing = [r for r in all_records if r['date'] == date]
        if not existing:
            all_records.append({
                'date': date,
                'status': 'WFH',
                'leave_type': '',
                'reason': '',
                'from_date': wfh_records[0]['from_date'] if wfh_records else '',
                'to_date': wfh_records[0]['to_date'] if wfh_records else ''
            })
    all_records.sort(key=lambda x: x['date'], reverse=True)   
    return render(request, 'view_attendance.html', {
        'all_records': all_records,
        'from_date': from_date,
        'to_date': to_date
    })


@login_required
def apply_wfh(request):
    success = False
    error = None   
    if request.method == 'POST':
        from_date = request.POST['from_date']
        to_date = request.POST['to_date']  
        overlapping = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=to_date,  
            to_date__gte=from_date   
        ).exists()
        leave_in_range = Leave.objects.filter(
            user=request.user,
            date__range=[from_date, to_date]
        ).exists()
        if overlapping:
            error = "Cannot apply - Overlaps with existing WFH period!"
        elif leave_in_range:
            error = "Cannot apply - You have Leave in this date range!"
        else:
            WorkFromHome.objects.create(
                user=request.user,
                from_date=from_date,
                to_date=to_date
            )
            success = True
    return render(request, 'wfh.html', {'success': success, 'error': error})


@login_required
def apply_leave(request):
    success = False
    error = None
    if request.method == 'POST':
        leave_date = request.POST['date']
        wfh = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=leave_date,
            to_date__gte=leave_date
        ).exists()
        if wfh:
            error = "Cannot apply leave - This date is within your Work From Home period!"
        elif Leave.objects.filter(user=request.user, date=leave_date).exists():
            error = "You already applied leave for this date!"
        else:
            Leave.objects.create(
                user=request.user,
                leave_type=request.POST['leave_type'],
                reason=request.POST['reason'],
                date=leave_date
            )
            success = True
    return render(request, 'leave.html', {'success': success, 'error': error})


def logout_view(request):
    logout(request)
    return redirect('login')
