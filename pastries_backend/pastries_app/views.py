from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, mixins
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.fields import DateTimeField
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .filters import MeasurementFilter, MeasurementOrderingFilter
from .models import Sensor, Series, Measurement
from .serializers import AuthTokenObtainSerializer, MeasurementCreateSerializer, PasswordChangeSerializer, UserSerializer, SeriesSerializer, SensorSerializer, MeasurementSerializer
from .mixins import LocationHeaderMixin
import hashlib
import secrets
from .authentication import SensorKeyAuthentication

class UserViewSet(LocationHeaderMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = UserSerializer

class HealthViewSet(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            status=200, 
            data={
                "status": "ok"
            }
        )

class LoginView(ObtainAuthToken):
    permission_classes = [AllowAny]
    serializer_class = AuthTokenObtainSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        request.user.auth_token.delete()
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
    permission_classes = [IsAuthenticated]

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

class MeasurementViewSet(
    LocationHeaderMixin, 
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
    ):
    permission_classes = [AllowAny]

    queryset = Measurement.objects.all()
    filter_backends = [DjangoFilterBackend, MeasurementOrderingFilter]
    filterset_class = MeasurementFilter
    ordering_fields = ["timestamp"]
    ordering = ["timestamp"]

    def get_queryset(self):
        queryset = super().get_queryset()
        date_time_field = DateTimeField()
        start = self.request.query_params.get("from")
        end = self.request.query_params.get("to")

        if start is not None:
            queryset = queryset.filter(
                timestamp__gte=date_time_field.run_validation(start)
            )
        if end is not None:
            queryset = queryset.filter(
                timestamp__lte=date_time_field.run_validation(end)
            )

        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return MeasurementCreateSerializer
        return MeasurementSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action == "create":
            context["sensor"] = SensorKeyAuthentication().get_authenticated_sensor(self.request)
        return context

    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        measurement = input_serializer.save()

        output_serializer = MeasurementSerializer(
            measurement,
            context=self.get_serializer_context()
        )
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data, 
            status=201, 
            headers=headers
        )
