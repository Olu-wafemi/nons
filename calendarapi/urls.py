from django.urls import path
from .views import CalendarApiView, redirect_to_google, google_callback, redirect_to_outlook, outlook_callback

urlpatterns = [
    path('api/calendar/', CalendarApiView.as_view(), name='health_data_profile'),

    # New paths for OAuth with Fitbit
    path('api/authorize-google/', redirect_to_google, name='authorize-fitbit'),
    path('api/google-callback/', google_callback, name='fitbit-callback'),
    path('api/authorize-outlook/', redirect_to_outlook, name='authorize-fitbit'),
    path('api/outlook-callback/', outlook_callback, name='fitbit-callback'),
]