from rest_framework import serializers
from .models import Customer

from ticket.serializers import SessionSerializer

class CustomerSerializer(serializers.ModelSerializer):
    recent_sessions = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'

    def get_recent_sessions(self, obj):
        from ticket.models import Session
        from ticket.serializers import SessionSerializer
        sessions = Session.objects.filter(customer=obj).order_by('-created_at')[:5]
        return SessionSerializer(sessions, many=True).data
