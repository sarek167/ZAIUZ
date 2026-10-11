from django.urls import path, include
from .views import LoginView, LogoutView, PasswordChangeView, UserViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)


urlpatterns = [
    path("api/", include(router.urls)),
    path("api/auth/login", LoginView.as_view(), name="login"),
    path("api/auth/logout", LogoutView.as_view(), name="logout"),
    path("api/auth/password", PasswordChangeView.as_view(), name="password-change"),
]