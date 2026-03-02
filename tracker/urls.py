from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('user-dashboard/', views.user_dashboard, name='user_dashboard'),
    path('attendance/', views.mark_attendance, name='attendance'),
    path('view-attendance/', views.view_attendance, name='view_attendance'),
    path('wfh/', views.apply_wfh, name='wfh'),
    path('leave/', views.apply_leave, name='leave'),
    path('logout/', views.logout_view, name='logout'),
]