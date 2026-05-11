from rest_framework import viewsets, filters
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name', 'phone']

    def get_queryset(self):
        return self.queryset
