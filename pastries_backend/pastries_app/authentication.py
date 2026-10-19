import hashlib
from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Sensor


class ExpiringTokenAuthentication(TokenAuthentication):
    keyword = "Bearer"

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if token.created + settings.AUTH_TOKEN_LIFETIME <= timezone.now():
            token.delete()
            raise AuthenticationFailed("Token has expired.")
        return user, token

class SensorKeyAuthentication():
    def get_authenticated_sensor(self, request):
        api_key = request.headers.get("X-API-KEY")
        if not api_key:
            raise AuthenticationFailed("API key is missing.")

        try:
            sensor = Sensor.objects.get(api_key_hash=hashlib.sha256(api_key.encode()).hexdigest())
        except Sensor.DoesNotExist:
            raise AuthenticationFailed("Invalid API key.")

        return sensor