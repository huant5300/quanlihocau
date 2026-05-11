from rest_framework import serializers
from .models import FishType, FishBuyback

class FishTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishType
        fields = '__all__'

class FishBuybackSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishBuyback
        fields = '__all__'
