from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=date.today)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    
    class Meta:
        unique_together = ['user', 'date']

class WorkFromHome(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    from_date = models.DateField()
    to_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True,null=True)

class Leave(models.Model):
    LEAVE_TYPES = [
        ('SL', 'Sick Leave'),
        ('PL', 'Paid Leave'),
        ('CL', 'Casual Leave'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=2, choices=LEAVE_TYPES)
    reason = models.TextField()
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    
    class Meta:
        unique_together = ['user', 'date']