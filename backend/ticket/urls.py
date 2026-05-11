from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, SessionProductViewSet, FishingPackageViewSet, HutViewSet, lake_info

router = DefaultRouter()
router.register(r'packages', FishingPackageViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'products', SessionProductViewSet)
router.register(r'huts', HutViewSet)

urlpatterns = [
    path('lake/', lake_info),
    path('', include(router.urls)),
]
