from rest_framework import viewsets
from .models import FishType, FishBuyback
from .serializers import FishTypeSerializer, FishBuybackSerializer

class FishTypeViewSet(viewsets.ModelViewSet):
    queryset = FishType.objects.all()
    serializer_class = FishTypeSerializer

class FishBuybackViewSet(viewsets.ModelViewSet):
    queryset = FishBuyback.objects.all()
    serializer_class = FishBuybackSerializer
