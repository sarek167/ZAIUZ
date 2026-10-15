from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Sensor, Series, Measurement
from .serializers import AccessTokenObtainSerializer, PasswordChangeSerializer, UserSerializer, SeriesSerializer, SensorSerializer, MeasurementSerializer
from .mixins import LocationHeaderMixin
import hashlib
import secrets

class UserViewSet(LocationHeaderMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = UserSerializer


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = AccessTokenObtainSerializer

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    # TODO: Dodać blokowanie tokenu
    def post(self, request):
        return Response(status=204)

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            raise PermissionDenied("Current password is incorrect.")

        new_password = serializer.validated_data["newPassword"]
        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            raise ValidationError({"new_password": exc.messages}) from exc

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response(status=204)

class SeriesViewSet(LocationHeaderMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

class SensorViewSet(LocationHeaderMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        api_key = secrets.token_urlsafe(32)
        sensor = serializer.save(
            api_key_hash = hashlib.sha256(api_key.encode("utf-8")).hexdigest()
        )
        response_data = dict(self.get_serializer(sensor).data)
        response_data["apiKey"] = api_key
        return Response(
            response_data, 
            status=201, 
            headers=self.get_success_headers(response_data)
        )

class MeasurementViewSet(LocationHeaderMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = Measurement.objects.all()
    serializer_class = MeasurementSerializer
