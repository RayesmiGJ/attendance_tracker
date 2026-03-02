from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from .models import Attendance, WorkFromHome, Leave
from datetime import date

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        print(f"Trying login: {username}")  # Add this
        user = authenticate(request, username=username, password=password)
        print(f"User object: {user}")  # Add this
        if user is not None:
            login(request, user)
            print(f"Login successful, redirecting...")  # Add this
            if username == 'ray':  # Change to your username
                return redirect('admin_dashboard')
            else:
                return redirect('user_dashboard')
        else:
            print("Authentication failed")  # Add this
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
    records = Attendance.objects.filter(user=request.user).order_by('-date')
    return render(request, 'view_attendance.html', {'records': records})

@login_required
def apply_wfh(request):
    success = False
    error = None
    
    if request.method == 'POST':
        from_date = request.POST['from_date']
        to_date = request.POST['to_date']
        
        # Check for overlapping WFH periods
        overlapping = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=to_date,
            to_date__gte=from_date
        ).exists()
        
        # Check for leave in this date range
        leave_in_range = Leave.objects.filter(
            user=request.user,
            date__range=[from_date, to_date]
        ).exists()
        
        if overlapping:
            error = "WFH already applied for this date range!"
        elif leave_in_range:
            error = "Cannot apply WFH - You have Leave in this date range!"
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
        
        # Check if WFH on that date
        wfh = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=leave_date,
            to_date__gte=leave_date
        ).exists()
        
        if wfh:
            error = "Cannot apply leave - You have Work From Home on this date!"
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