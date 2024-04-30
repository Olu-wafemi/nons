from django.conf import settings

from rest_framework.response import Response
from rest_framework.views import APIView

import boto3
import json

# Create your views here.


class LoginUserAPI(APIView):
    def post(self, request):
        # Extract login credentials
        email = request.data.get("email")
        password = request.data.get("password")

        # Initialize Cognito client
        client = boto3.client(
            "cognito-idp",
            region_name=settings.COGNITO_AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        try:
            # Attempt to authenticate the user using AWS Cognito
            response = client.initiate_auth(
                ClientId=settings.COGNITO_AUDIENCE,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={"USERNAME": email, "PASSWORD": password},
            )

            return Response(
                {"message": "Login successful", "details": response}, status=200
            )

        except client.exceptions.NotAuthorizedException:
            return Response(
                {"error": "Login failed, incorrect username or password"}, status=401
            )
        except client.exceptions.UserNotFoundException:
            return Response({"error": "User does not exist"}, status=404)
        except Exception as e:
            # Generic error handling if an unexpected error occurs
            return Response({"error": str(e)}, status=500)


class RegisterUserAPI(APIView):
    def post(self, request):
        # Extract user data from the request
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("firstname")
        last_name = request.data.get("lastname")
        preferences = {
            "wakeup_time": request.data.get("wakeup_time"),
            "work_hours": request.data.get("work_hours"),
            "pref_wellness_activity_times": request.data.get(
                "pref_wellness_activity_times"
            ),
            "sleep_time": request.data.get("sleep_time"),
        }

        # Initialize Cognito client
        client = boto3.client(
            "cognito-idp",
            region_name=settings.COGNITO_AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        try:
            # Call AWS Cognito to sign up the user
            response = client.sign_up(
                ClientId=settings.COGNITO_AUDIENCE,
                Username=email,
                Password=password,
                UserAttributes=[
                    {"Name": "email", "Value": email},
                    {"Name": "custom:first_name", "Value": first_name},
                    {"Name": "custom:last_name", "Value": last_name},
                    {"Name": "name", "Value": f"{first_name} {last_name}"},
                ],
                ValidationData=[{"Name": "email", "Value": email}],
            )

            # Prepare user preferences data for Lambda function
            lambda_client = boto3.client(
                "lambda",
                region_name=settings.COGNITO_AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            lambda_payload = {
                "user_id": response["UserSub"],
                "preferences": preferences,
            }
            lambda_response = lambda_client.invoke(
                FunctionName="LambdaSaveUserPreference",
                InvocationType="Event",
                Payload=json.dumps(lambda_payload),
            )

            return Response(
                {"message": "User registered successfully", "details": response},
                status=201,
            )
        except client.exceptions.UsernameExistsException:
            return Response({"error": "This username already exists"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

