from rest_framework import serializers
from .models import Session, SessionProduct, FishingPackage, Hut

class HutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hut
        fields = '__all__'

class FishingPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishingPackage
        fields = '__all__'

class SessionProductSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.name', read_only=True)
    price = serializers.DecimalField(source='price_at_time', max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = SessionProduct
        fields = ['id', 'session', 'product', 'quantity', 'price_at_time', 'name', 'price']

from fish.serializers import FishBuybackSerializer

class SessionSerializer(serializers.ModelSerializer):
    session_products = SessionProductSerializer(many=True, read_only=True)
    fish_buybacks = FishBuybackSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = Session
        fields = '__all__'
