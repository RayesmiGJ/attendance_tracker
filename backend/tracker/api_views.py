from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from datetime import date, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_date
from .models import Attendance, WorkFromHome, Leave
from .serializers import (UserSerializer, AttendanceSerializer,
                          WorkFromHomeSerializer, LeaveSerializer, LoginSerializer)

def get_ist_now():
    return timezone.now() + timedelta(hours=5, minutes=30)

def mark_absent_if_needed(user, target_date):
    if Attendance.objects.filter(user=user, date=target_date).exists():
        return False
    if Leave.objects.filter(user=user, date=target_date).exists():
        return False
    if WorkFromHome.objects.filter(
        user=user,
        from_date__lte=target_date,
        to_date__gte=target_date
    ).exists():
        return False

    Leave.objects.create(
        user=user,
        leave_type='AB',          
        reason='No Reason Provided',
        date=target_date
    )
    return True

def process_missing_attendance(user, until_date=None):
    if until_date is None:
        until_date = date.today()

    ist_now = get_ist_now()
    if until_date == date.today() and ist_now.hour < 18:
        until_date = until_date - timedelta(days=1)

    start_date = user.date_joined.date() if user.date_joined else until_date - timedelta(days=90)

    current = start_date
    while current <= until_date:
        if current <= date.today():
            mark_absent_if_needed(user, current)
        current += timedelta(days=1)
        

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        process_missing_attendance(user)

        user_data = UserSerializer(user).data
        user_data['is_admin'] = user.is_superuser
        return Response({
            'success': True,
            'user': user_data,
            'message': 'Login successful'
        })
    else:
        return Response({
            'success': False,
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_api(request):
    logout(request)
    return Response({'success': True, 'message': 'Logged out successfully'})

@api_view(['GET'])
def check_auth(request):
    if request.user.is_authenticated:
        user_data = UserSerializer(request.user).data
        user_data['is_admin'] = request.user.is_superuser
        return Response({
            'authenticated': True,
            'user': user_data
        })
    return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    user_data = UserSerializer(request.user).data
    user_data['is_admin'] = request.user.is_superuser
    today = date.today()
    attendance_today = Attendance.objects.filter(user=request.user, date=today).exists()
    wfh_active = WorkFromHome.objects.filter(
        user=request.user,
        from_date__lte=today,
        to_date__gte=today
    ).exists()
    leave_today = Leave.objects.filter(user=request.user, date=today).exists()
    return Response({
        'user': user_data,
        'stats': {
            'attendance_today': attendance_today,
            'wfh_active': wfh_active,
            'leave_today': leave_today,
            'total_attendance': Attendance.objects.filter(user=request.user).count(),
            'total_leave': Leave.objects.filter(user=request.user).count()
        }
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def attendance_api(request):
    today = date.today()
    if request.method == 'GET':
        wfh = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=today,
            to_date__gte=today
        ).exists()
        leave = Leave.objects.filter(user=request.user, date=today).exists()
        already_marked = Attendance.objects.filter(user=request.user, date=today).exists()
        return Response({
            'can_mark': not (wfh or leave or already_marked),
            'already_marked': already_marked,
            'on_wfh': wfh,
            'on_leave': leave,
            'today': today
        })
    elif request.method == 'POST':
        wfh = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=today,
            to_date__gte=today
        ).exists()
        leave = Leave.objects.filter(user=request.user, date=today).exists()
        already_marked = Attendance.objects.filter(user=request.user, date=today).exists()
        if wfh:
            return Response({'error': 'Cannot mark - You are on Work From Home today'},
                            status=status.HTTP_400_BAD_REQUEST)
        if leave:
            return Response({'error': 'Cannot mark - You are on Leave today'},
                            status=status.HTTP_400_BAD_REQUEST)
        if already_marked:
            return Response({'error': 'Already marked today'},
                            status=status.HTTP_400_BAD_REQUEST)
        attendance = Attendance.objects.create(user=request.user, date=today)
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_attendance_api(request):
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

    all_records = []
    for record in attendance_records:
        all_records.append({
            'date': record.date,
            'status': 'Present',
            'type': 'attendance',
            'details': '',
            'applied_on': record.created_at.isoformat()
        })
    for record in leave_records:
        applied_on_value = record.created_at.isoformat() if record.leave_type != 'AB' else None
        all_records.append({
            'date': record.date,
            'status': 'Leave',
            'type': 'leave',
            'details': f"{record.get_leave_type_display()} - {record.reason}",
            'applied_on': applied_on_value,
        })
    wfh_dates = []
    wfh_created_map = {}
    for wfh in wfh_records:
        current = wfh.from_date
        while current <= wfh.to_date:
            if from_date and to_date:
                from_obj = parse_date(from_date)
                to_obj = parse_date(to_date)
                if from_obj <= current <= to_obj:
                    wfh_dates.append(current)
                    wfh_created_map[current.isoformat()] = wfh.created_at.isoformat()
            else:
                wfh_dates.append(current)
                wfh_created_map[current.isoformat()] = wfh.created_at.isoformat()
            current += timedelta(days=1)

    for wfh_date in set(wfh_dates):
        existing = [r for r in all_records if r['date'] == wfh_date]
        if not existing:
            all_records.append({
                'date': wfh_date,
                'status': 'WFH',
                'type': 'wfh',
                'details': '',
                'applied_on': wfh_created_map.get(wfh_date.isoformat(), None)
            })

    all_records.sort(key=lambda x: x['date'], reverse=True)
    return Response({
        'records': all_records,
        'filters': {
            'from_date': from_date,
            'to_date': to_date
        }
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wfh_api(request):
    if request.method == 'GET':
        wfh_records = WorkFromHome.objects.filter(user=request.user).order_by('-from_date')
        serializer = WorkFromHomeSerializer(wfh_records, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        from_date = request.data.get('from_date')
        to_date = request.data.get('to_date')

        if not from_date or not to_date:
            return Response({'error': 'Both from_date and to_date are required'},
                            status=status.HTTP_400_BAD_REQUEST)

        today = date.today().isoformat()
        if from_date <= today:
            return Response(
                {'error': 'Cannot apply WFH for today or past dates. Please apply for future dates only.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        overlapping = WorkFromHome.objects.filter(
            user=request.user,
            from_date__lte=to_date,
            to_date__gte=from_date
        ).exists()

        leave_in_range = Leave.objects.filter(
            user=request.user,
            date__range=[from_date, to_date]
        ).exists()

        attendance_in_range = Attendance.objects.filter(
            user=request.user,
            date__range=[from_date, to_date]
        ).exists()

        if overlapping:
            return Response({'error': 'Cannot apply - Overlaps with existing WFH period!'},
                            status=status.HTTP_400_BAD_REQUEST)
        elif leave_in_range:
            return Response({'error': 'Cannot apply - You have Leave in this date range!'},
                            status=status.HTTP_400_BAD_REQUEST)
        elif attendance_in_range:
            return Response({'error': 'Cannot apply - You have already marked attendance for some dates in this range!'},
                            status=status.HTTP_400_BAD_REQUEST)
        else:
            wfh = WorkFromHome.objects.create(
                user=request.user,
                from_date=from_date,
                to_date=to_date
            )
            serializer = WorkFromHomeSerializer(wfh)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def leave_api(request):
    if request.method == 'GET':
        leave_records = Leave.objects.filter(user=request.user).order_by('-date')
        serializer = LeaveSerializer(leave_records, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        leave_type = request.data.get('leave_type')
        reason = request.data.get('reason')

        leave_date = request.data.get('date')
        from_date = request.data.get('from_date')
        to_date = request.data.get('to_date')

        if not all([leave_type, reason]):
            return Response({'error': 'Leave type and reason are required'},
                            status=status.HTTP_400_BAD_REQUEST)

        if leave_date:
            if not leave_date:
                return Response({'error': 'Date is required'},
                                status=status.HTTP_400_BAD_REQUEST)

            wfh = WorkFromHome.objects.filter(
                user=request.user,
                from_date__lte=leave_date,
                to_date__gte=leave_date
            ).exists()
            already_marked = Attendance.objects.filter(
                user=request.user,
                date=leave_date
            ).exists()

            if wfh:
                return Response({'error': f'Cannot apply leave for {leave_date} - This date is within your Work From Home period!'},
                                status=status.HTTP_400_BAD_REQUEST)
            if already_marked:
                return Response({'error': f'Cannot apply leave for {leave_date} - You already marked attendance for this date!'},
                                status=status.HTTP_400_BAD_REQUEST)
            if Leave.objects.filter(user=request.user, date=leave_date).exists():
                return Response({'error': f'You already applied leave for {leave_date}!'},
                                status=status.HTTP_400_BAD_REQUEST)

            leave = Leave.objects.create(
                user=request.user,
                leave_type=leave_type,
                reason=reason,
                date=leave_date
            )
            serializer = LeaveSerializer(leave)
            return Response({
                'message': 'Leave applied successfully!',
                'leaves': [serializer.data]
            }, status=status.HTTP_201_CREATED)

        elif from_date and to_date:
            if from_date > to_date:
                return Response({'error': 'From date must be before or equal to To date'},
                                status=status.HTTP_400_BAD_REQUEST)
            from_date_obj = parse_date(from_date)
            to_date_obj = parse_date(to_date)
            if not from_date_obj or not to_date_obj:
                return Response({'error': 'Invalid date format'},
                                status=status.HTTP_400_BAD_REQUEST)

            wfh_in_range = WorkFromHome.objects.filter(
                user=request.user,
                from_date__lte=to_date,
                to_date__gte=from_date
            ).exists()
            if wfh_in_range:
                return Response({'error': 'Cannot apply leave - This date range overlaps with your Work From Home period!'},
                                status=status.HTTP_400_BAD_REQUEST)

            attendance_in_range = Attendance.objects.filter(
                user=request.user,
                date__range=[from_date, to_date]
            ).exists()
            if attendance_in_range:
                return Response({'error': 'Cannot apply leave - You have marked attendance for some dates in this range!'},
                                status=status.HTTP_400_BAD_REQUEST)

            leave_in_range = Leave.objects.filter(
                user=request.user,
                date__range=[from_date, to_date]
            ).exists()
            if leave_in_range:
                return Response({'error': 'You already applied leave for some dates in this range!'},
                                status=status.HTTP_400_BAD_REQUEST)

            created_leaves = []
            current_date = from_date_obj
            while current_date <= to_date_obj:
                leave = Leave.objects.create(
                    user=request.user,
                    leave_type=leave_type,
                    reason=reason,
                    date=current_date
                )
                created_leaves.append(leave)
                current_date += timedelta(days=1)

            serializer = LeaveSerializer(created_leaves, many=True)
            return Response({
                'message': f'{len(created_leaves)} leave days applied successfully',
                'leaves': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Please provide either a single date or from_date and to_date'},
                            status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_api(request):
    if not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)