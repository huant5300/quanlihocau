from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FishTypeViewSet, FishBuybackViewSet

router = DefaultRouter()
router.register(r'types', FishTypeViewSet)
router.register(r'buybacks', FishBuybackViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
