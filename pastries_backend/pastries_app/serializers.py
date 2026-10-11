from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )
    new_password = serializers.CharField(
        trim_whitespace=False,
        style={"input_type": "password"},
        write_only=True,
    )