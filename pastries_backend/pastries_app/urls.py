from django.urls import path, include
from .views import HealthViewSet, LoginView, LogoutView, MeasurementViewSet, PasswordChangeView, SensorViewSet, SeriesViewSet, UserViewSet
from rest_framework import routers

slashless_router = routers.SimpleRouter(trailing_slash=False)
slashless_router.register(r'users', UserViewSet)
slashless_router.register(r'sensors', SensorViewSet)
slashless_router.register(r'series', SeriesViewSet)
slashless_router.register(r'measurements', MeasurementViewSet)

urlpatterns = [
    path("api/", include(slashless_router.urls)),
    path("api/health", HealthViewSet.as_view(), name="health"),
    path("api/auth/login", LoginView.as_view(), name="login"),
    path("api/auth/logout", LogoutView.as_view(), name="logout"),
    path("api/auth/password", PasswordChangeView.as_view(), name="password-change"),
]