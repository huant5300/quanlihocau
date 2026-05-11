from rest_framework import serializers
from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'phone', 'address', 'logo', 'timezone',
            'currency', 'is_active', 'owner', 'owner_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner_username']

    def validate_name(self, value):
        """Ensure tenant name is unique per owner"""
        owner = self.context['request'].user
        queryset = Tenant.objects.filter(name=value, owner=owner)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A tenant with this name already exists for this owner.")
        return value


class TenantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['name', 'phone', 'address', 'logo', 'timezone', 'currency']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class TenantUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['name', 'phone', 'address', 'logo', 'timezone', 'currency', 'is_active']
