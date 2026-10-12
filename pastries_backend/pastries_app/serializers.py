from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.settings import api_settings

from .models import Sensor, Series, Measurement


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
    createdAt = serializers.DateTimeField(source='created_at')
    seriesId = serializers.PrimaryKeyRelatedField(source='series', queryset=Series.objects.all())
    class Meta:
        model = Sensor
        fields = ['id', 'name', 'createdAt', 'seriesId']

class MeasurementSerializer(serializers.ModelSerializer):
    seriesId = serializers.PrimaryKeyRelatedField(source='series', queryset=Series.objects.all())
    sensorId = serializers.PrimaryKeyRelatedField(source='sensor', queryset=Sensor.objects.all(), allow_null=True, required=False)
    
    class Meta:
        model = Measurement
        fields = ['id', 'timestamp', 'value', 'seriesId', 'sensorId']