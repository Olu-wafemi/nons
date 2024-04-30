from django.urls import path
from .views import RegisterUserAPI, LoginUserAPI

urlpatterns = [
    path('api/register/', RegisterUserAPI.as_view(), name='register_user'),
    path('api/login/', LoginUserAPI.as_view(), name='login_user'),
]