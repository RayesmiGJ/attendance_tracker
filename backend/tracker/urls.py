from django.urls import path
from . import api_views 

urlpatterns = [
    path('login/', api_views.login_api, name='api_login'),
    path('logout/', api_views.logout_api, name='api_logout'),
    path('check-auth/', api_views.check_auth, name='api_check_auth'),
    path('dashboard/', api_views.get_dashboard, name='api_dashboard'),
    path('attendance/', api_views.attendance_api, name='api_attendance'),
    path('attendance/view/', api_views.view_attendance_api, name='api_view_attendance'),
    path('wfh/', api_views.wfh_api, name='api_wfh'),
    path('leave/', api_views.leave_api, name='api_leave'),
    path('admin/users/', api_views.admin_users_api, name='api_admin_users'),
]