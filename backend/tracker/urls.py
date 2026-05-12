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
     path('admin/all-users-with-activity/', api_views.admin_all_users_with_activity, name='admin_all_users_with_activity'),
    path('admin/create-user/', api_views.admin_create_user, name='admin_create_user'),
    path('admin/leave-requests/', api_views.admin_leave_requests, name='admin_leave_requests'),
    path('admin/leave-action/<int:leave_id>/', api_views.admin_leave_action, name='admin_leave_action'),
]