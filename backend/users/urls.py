from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, GoogleLogin

router = DefaultRouter()
router.register(r'', UserViewSet)

urlpatterns = [
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('', include(router.urls)),
]
