from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Attendance, WorkFromHome, Leave

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class AttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'user_name', 'date', 'status', 'created_at']
        read_only_fields = ['user', 'created_at']

class WorkFromHomeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = WorkFromHome
        fields = ['id', 'user', 'user_name', 'from_date', 'to_date', 'created_at']
        read_only_fields = ['user', 'created_at']

class LeaveSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    get_leave_type_display = serializers.CharField(read_only=True) 
    
    class Meta:
        model = Leave
        fields = ['id', 'user', 'user_name', 'leave_type', 'get_leave_type_display', 
                  'reason', 'date', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)