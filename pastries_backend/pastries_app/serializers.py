from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.settings import api_settings

from .models import Sensor


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class AccessTokenObtainSerializer(TokenObtainSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        token = AccessToken.for_user(self.user)

        data["accessToken"] = str(token)
        data["tokenType"] = "Bearer"
        data["expiresIn"] = int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds())
        return data

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )
    new_password = serializers.CharField(
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ['id', 'name', 'api_key_hash', 'series']