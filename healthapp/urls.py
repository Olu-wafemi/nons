from django.urls import path
from .views import HealthDataProfileApiView, redirect_to_fitbit, fitbit_callback

urlpatterns = [
    path('api/health/', HealthDataProfileApiView.as_view(), name='health_data_profile'),

    # New paths for OAuth with Fitbit
    path('api/authorize-fitbit/', redirect_to_fitbit, name='authorize-fitbit'),
    path('api/fitbit-callback/', fitbit_callback, name='fitbit-callback')
]