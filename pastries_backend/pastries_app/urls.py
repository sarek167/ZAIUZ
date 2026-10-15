from django.urls import path, include
from .views import LoginView, LogoutView, MeasurementViewSet, PasswordChangeView, SensorViewSet, SeriesViewSet, UserViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sensors', SensorViewSet)
router.register(r'series', SeriesViewSet)
router.register(r'measurements', MeasurementViewSet)

slashless_router = routers.SimpleRouter(trailing_slash=False)
slashless_router.register(r'users', UserViewSet)
slashless_router.register(r'sensors', SensorViewSet)
slashless_router.register(r'series', SeriesViewSet)
slashless_router.register(r'measurements', MeasurementViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/", include(slashless_router.urls)),
    path("api/auth/login", LoginView.as_view(), name="login"),
    path("api/auth/logout", LogoutView.as_view(), name="logout"),
    path("api/auth/password", PasswordChangeView.as_view(), name="password-change"),
]