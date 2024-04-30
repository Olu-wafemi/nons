from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect

from rest_framework.views import APIView

from requests_oauthlib import OAuth2Session
import boto3
import os
import json
# Create your views here.

class CalendarApiView(APIView):
    def post(self, request):
        source = request.data.get("source")
        # Utilize the 'source' parameter to determine calendar
        if source.lower() == "google":
            data = self.fetch_google_calendar_data()

        elif source.lower() == 'apple':
            data = self.fetch_outlook_calendar_data()
        print(data)
        return HttpResponse(data, status=200)

    def fetch_google_calendar_data(self):
        lambda_client = boto3.client(
            "lambda",
            region_name=settings.COGNITO_AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        lambda_response = lambda_client.invoke(
            FunctionName="OAuthTokenHandler",
            InvocationType="RequestResponse",
        )

        response_payload = lambda_response['Payload'].read()  # Read the StreamingBody object
        response_payload = json.loads(response_payload)  # Convert the JSON string to a Python dictionary

        return response_payload

    def fetch_outlook_calendar_data(self):
        pass

def redirect_to_google(request):
    """Redirects the user to Google OAuth login."""
    try:
        # Create an OAuth2 session instance
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        google = OAuth2Session(
            settings.GOOGLE_CLIENT_ID,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
            scope=settings.GOOGLE_SCOPE
        )
        # Get the authorization URL and state
        authorization_url, state = google.authorization_url(
            settings.GOOGLE_AUTHORIZATION_URL,
            access_type="offline", prompt="select_account"
        )

        # Store the state in session for later validation
        request.session['oauth_state'] = state
        return HttpResponseRedirect(authorization_url)
    except Exception as e:
        return HttpResponse(f"An error occurred: {e}", status=500)

def google_callback(request):
    """The callback function for when Google redirects back to your site."""
    try:
        # Recreate the OAuth2 session instance
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        google = OAuth2Session(
            settings.GOOGLE_CLIENT_ID,
            state=request.session.get('oauth_state', None),  # Use the saved state
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )

        # Fetch the authentication token
        tokens = google.fetch_token(
            settings.GOOGLE_TOKEN_URL,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            authorization_response=request.build_absolute_uri()
        )
        access_token = tokens.get("access_token", "No access token found.")
        refresh_token = tokens.get("refresh_token", "No refresh token found.")
        secrets_manager = boto3.client(
            "secretsmanager",
            region_name=settings.COGNITO_AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        secret_name = (
            "google_oauth2"  # Use the same name as you created in AWS Secrets Manager
        )

        secret_string = json.dumps(
            {
                "google_client_id": settings.GOOGLE_CLIENT_ID,
                "google_client_secret": settings.GOOGLE_CLIENT_SECRET,
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        )
        update_secret_response = secrets_manager.put_secret_value(
            SecretId=secret_name, SecretString=secret_string
        )
        print(update_secret_response)
        # At this point, token contains the access token which can be used to make authenticated requests to Google
        # You might want to save this in your database
        return HttpResponse(f"Access token: {access_token}")
    except Exception as e:
        return HttpResponse(f"An error occurred: {e}", status=500)
    
def redirect_to_outlook(request):
    """Redirects the user to Outlook OAuth login."""
    try:
        outlook = OAuth2Session(
            settings.OUTLOOK_CLIENT_ID,
            redirect_uri=settings.OUTLOOK_REDIRECT_URI,
            scope=settings.OUTLOOK_SCOPE
        )
        authorization_url, state = outlook.authorization_url(
            settings.OUTLOOK_AUTHORIZATION_URL,
            prompt="login"
        )
        request.session['oauth_state'] = state
        return HttpResponseRedirect(authorization_url)
    except Exception as e:
        return HttpResponse(f"An error occurred: {e}", status=500)

def outlook_callback(request):
    """The callback function for when Outlook redirects back to your site."""
    try:
        outlook = OAuth2Session(
            settings.OUTLOOK_CLIENT_ID,
            state=request.session.get('oauth_state'),
            redirect_uri=settings.OUTLOOK_REDIRECT_URI
        )
        tokens = outlook.fetch_token(
            settings.OUTLOOK_TOKEN_URL,
            client_secret=settings.OUTLOOK_CLIENT_SECRET,
            authorization_response=request.build_absolute_uri()
        )
        # Store tokens and handle further logic like storing in AWS Secrets Manager
        return HttpResponse(f"Access token: {tokens.get('access_token', 'No access token found.')}")
    except Exception as e:
        return HttpResponse(f"An error occurred: {e}", status=500)