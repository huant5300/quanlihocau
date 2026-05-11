from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Tenant
from .serializers import (
    TenantSerializer,
    TenantCreateSerializer,
    TenantUpdateSerializer
)
from .permissions import TenantPermission, CanCreateTenant
from .services import TenantService


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tenants in the SaaS system.

    Provides CRUD operations with role-based permissions:
    - SUPER_ADMIN: Full access to all tenants
    - OWNER: Access to own tenants only
    - STAFF: Read-only access to active tenants
    """
    queryset = Tenant.objects.all()
    permission_classes = [TenantPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'owner']
    search_fields = ['name', 'phone', 'address']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TenantUpdateSerializer
        return TenantSerializer

    def get_queryset(self):
        """Filter queryset based on user role"""
        return TenantService.get_tenants_for_user(self.request.user)

    def perform_create(self, serializer):
        """Create tenant using service layer"""
        TenantService.create_tenant(
            owner=self.request.user,
            **serializer.validated_data
        )

    def perform_update(self, serializer):
        """Update tenant using service layer"""
        TenantService.update_tenant(
            tenant=self.get_object(),
            **serializer.validated_data
        )

    @swagger_auto_schema(
        operation_description="Deactivate a tenant",
        responses={200: TenantSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[CanCreateTenant])
    def deactivate(self, request, pk=None):
        """Deactivate a tenant (soft delete)"""
        tenant = self.get_object()
        TenantService.deactivate_tenant(tenant)
        serializer = self.get_serializer(tenant)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Get tenant statistics",
        responses={
            200: openapi.Response(
                description="Tenant statistics",
                examples={
                    "application/json": {
                        "total_tenants": 10,
                        "active_tenants": 8,
                        "inactive_tenants": 2
                    }
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get tenant statistics for the current user"""
        queryset = self.get_queryset()
        total = queryset.count()
        active = queryset.filter(is_active=True).count()
        inactive = total - active

        return Response({
            'total_tenants': total,
            'active_tenants': active,
            'inactive_tenants': inactive
        })
