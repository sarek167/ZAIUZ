from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ExpiringTokenAuthentication(TokenAuthentication):
    keyword = "Bearer"

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if token.created + settings.AUTH_TOKEN_LIFETIME <= timezone.now():
            token.delete()
            raise AuthenticationFailed("Token has expired.")
        return user, token
