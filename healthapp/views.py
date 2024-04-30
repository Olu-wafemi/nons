from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect

from rest_framework.response import Response
from rest_framework.views import APIView

from .config import SAMPLE_FITBIT_RESPONSE

import boto3
import json
import requests
import base64
# Create your views here.

class HealthDataProfileApiView(APIView):
    def post(self, request):
        source = request.data.get("source")
        preference_data = request.data.get("preference_data")
        # Utilize the 'source' parameter to determine data handling
        if source.lower() == "fitbit":
            data = self.fetch_fitbit_data()
            lambda_client = boto3.client(
                "lambda",
                region_name=settings.COGNITO_AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )

            lambda_payload = {
                "preference_data": preference_data,
                "fitbit_data": data,
            }

            lambda_response = lambda_client.invoke(
                FunctionName="CreateWellnessActivity",
                InvocationType="RequestResponse",
                Payload=json.dumps(lambda_payload),
            )

        elif source.lower() == "apple_health":
            data = self.fetch_apple_data()
        else:
            return Response({"error": "Invalid data source specified"}, status=400)

        return Response(data, safe=False)

    def fetch_fitbit_data(self):
        lambda_client = boto3.client(
            "lambda",
            region_name=settings.COGNITO_AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        lambda_response = lambda_client.invoke(
            FunctionName="GetFitbitData",
            InvocationType="RequestResponse",
        )

        # Sample Lambda Response
        lambda_response = SAMPLE_FITBIT_RESPONSE
        return lambda_response

    def fetch_apple_data(self):
        pass


# OAuth2 Authentication of Fitbit application
def redirect_to_fitbit(request):
    auth_url = f"{settings.FITBIT_AUTH_URI}?response_type=code&client_id={settings.FITBIT_CLIENT_ID}&redirect_uri={settings.FITBIT_REDIRECT_URI}&scope={settings.FITBIT_SCOPE}&prompt=consent"
    print(auth_url)
    return HttpResponseRedirect(auth_url)


def fitbit_callback(request):
    code = request.GET.get("code")
    if not code:
        return HttpResponse("Authorization failed, no code received.", status=400)

    token_url = "https://api.fitbit.com/oauth2/token"
    credentials = f"{settings.FITBIT_CLIENT_ID}:{settings.FITBIT_CLIENT_SECRET}"
    b64credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64credentials}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    body = {
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.FITBIT_REDIRECT_URI,
    }

    response = requests.post(token_url, headers=headers, data=body)
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens.get("access_token", "No access token found.")
        refresh_token = tokens.get("refresh_token", "No refresh token found.")
        # Save tokens to AWS Secrets Manager
        secrets_manager = boto3.client(
            "secretsmanager",
            region_name=settings.COGNITO_AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        secret_name = (
            "fitbit_oauth2"  # Use the same name as you created in AWS Secrets Manager
        )
        secret_string = json.dumps(
            {
                "fitbit_client_id": settings.FITBIT_CLIENT_ID,
                "fitbit_client_secret": settings.FITBIT_CLIENT_SECRET,
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        )
        update_secret_response = secrets_manager.put_secret_value(
            SecretId=secret_name, SecretString=secret_string
        )

        return HttpResponse(f"Access token: {access_token}")
    else:
        return HttpResponse("Failed to retrieve access token.", status=400)
