from django.contrib import admin
from .models import Attendance, WorkFromHome, Leave

admin.site.register(Attendance)
admin.site.register(WorkFromHome)
admin.site.register(Leave)