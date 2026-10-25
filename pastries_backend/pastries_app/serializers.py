from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.authtoken.models import Token
from .exceptions import SeriesNotFound, SeriesRangeConflict, SeriesRangeInvalid, MeasurementValueOutOfRange, MeasurementTimestampError, WrongCredentials
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
            raise WrongCredentials()

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

    def validate(self, attrs):
        min_value = attrs.get(
            'min_value',
            self.instance.min_value if self.instance else None
        )
        max_value = attrs.get(
            'max_value',
            self.instance.max_value if self.instance else None
        )
        if min_value is not None and max_value is not None and min_value >= max_value:
            raise SeriesRangeInvalid("The series range cannot have min_value greater than or equal to max_value.")
        if self.instance:
            measurements = Measurement.objects.filter(series=self.instance)
            if (measurements.filter(value__lt=min_value).exists() or
                measurements.filter(value__gt=max_value).exists()):
                raise SeriesRangeConflict("The series range cannot exclude existing measurements.")
        return attrs

class SeriesPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if self.pk_field is not None:
            data = self.pk_field.to_internal_value(data)
        try:
            return self.get_queryset().get(pk=data)
        except Series.DoesNotExist:
            raise SeriesNotFound("The specified series was not found.")
        except (TypeError, ValueError):
            self.fail('incorrect_type', data_type=type(data).__name__)

class SensorSerializer(serializers.ModelSerializer):
    seriesId = SeriesPrimaryKeyRelatedField(source='series', queryset=Series.objects.all())

    class Meta:
        model = Sensor
        fields = ['id', 'name', 'seriesId']

class MeasurementSerializer(serializers.ModelSerializer):
    seriesId = SeriesPrimaryKeyRelatedField(source='series', queryset=Series.objects.all())
    sensorId = serializers.PrimaryKeyRelatedField(source='sensor', queryset=Sensor.objects.all(), allow_null=True, required=False)
    
    class Meta:
        model = Measurement
        fields = ['id', 'timestamp', 'value', 'seriesId', 'sensorId']

class MeasurementCreateSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(required=False, default=timezone.now)

    class Meta:
        model = Measurement
        fields = ['timestamp', 'value']

    def validate(self, attrs):
        sensor = self.context.get('sensor')
        series = sensor.series if sensor else None
        value = attrs.get('value')
        if series and value is not None:
            if series.min_value is not None and value < series.min_value:
                raise MeasurementValueOutOfRange(f"Value {value} is below the minimum allowed for this series ({series.min_value}).")
            if series.max_value is not None and value > series.max_value:
                raise MeasurementValueOutOfRange(f"Value {value} is above the maximum allowed for this series ({series.max_value}).")
        
        if attrs.get('timestamp') and attrs['timestamp'] > timezone.now() + timedelta(minutes=5):
            raise MeasurementTimestampError("Timestamp cannot be in the future.")
        return attrs

    def create(self, validated_data):
        sensor = self.context.get('sensor')
        return Measurement.objects.create(sensor=sensor, series=sensor.series, **validated_data)