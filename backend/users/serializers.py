from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.ImageField(source='avatar', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role', 'avatar', 'avatar_url', 'google_id')
        read_only_fields = ('id', 'role')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
