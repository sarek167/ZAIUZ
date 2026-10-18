from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.authtoken.models import Token

from .models import Sensor, Series, Measurement


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class AuthTokenObtainSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        style={"input_type": "password"},
        trim_whitespace=False,
        write_only=True,
    )

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["username"],
            password=attrs["password"],
        )
        if user is None or not user.is_active:
            raise serializers.ValidationError(
                "Unable to log in with the provided credentials.",
                code="authorization",
            )

        token, _ = Token.objects.get_or_create(user=user)
        if token.created + settings.AUTH_TOKEN_LIFETIME <= timezone.now():
            token.delete()
            token = Token.objects.create(user=user)

        return {
            "accessToken": token.key,
            "tokenType": "Bearer",
            "expiresIn": int(settings.AUTH_TOKEN_LIFETIME.total_seconds()),
        }

class PasswordChangeSerializer(serializers.Serializer):
    currentPassword = serializers.CharField(
        source="current_password",
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )
    newPassword = serializers.CharField(
        source="new_password",
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )

class SeriesSerializer(serializers.ModelSerializer):
    minValue = serializers.FloatField(source='min_value')
    maxValue = serializers.FloatField(source='max_value')
    
    class Meta:
        model = Series
        fields = ['id', 'name', 'minValue', 'maxValue', 'color']

class SensorSerializer(serializers.ModelSerializer):
    seriesId = serializers.PrimaryKeyRelatedField(source='series', queryset=Series.objects.all())

    class Meta:
        model = Sensor
        fields = ['id', 'name', 'seriesId']

class MeasurementSerializer(serializers.ModelSerializer):
    seriesId = serializers.PrimaryKeyRelatedField(source='series', queryset=Series.objects.all())
    sensorId = serializers.PrimaryKeyRelatedField(source='sensor', queryset=Sensor.objects.all(), allow_null=True, required=False)
    
    class Meta:
        model = Measurement
        fields = ['id', 'timestamp', 'value', 'seriesId', 'sensorId']