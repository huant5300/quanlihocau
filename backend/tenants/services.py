from django.db import transaction
from .models import Tenant


class TenantService:
    @staticmethod
    def create_tenant(owner, **validated_data):
        """Create a new tenant with business logic"""
        with transaction.atomic():
            tenant = Tenant.objects.create(owner=owner, **validated_data)
            # Additional business logic can be added here
            # e.g., create default settings, send notifications, etc.
            return tenant

    @staticmethod
    def update_tenant(tenant, **validated_data):
        """Update tenant with business logic"""
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(tenant, attr, value)
            tenant.save()
            # Additional business logic
            return tenant

    @staticmethod
    def deactivate_tenant(tenant):
        """Soft deactivate tenant"""
        tenant.is_active = False
        tenant.save()
        return tenant

    @staticmethod
    def get_tenants_for_user(user):
        """Get tenants based on user role"""
        from users.models import User

        if user.role == User.SUPER_ADMIN:
            return Tenant.objects.all()
        elif user.role == User.OWNER:
            return Tenant.objects.filter(owner=user)
        else:
            # Staff can see active tenants
            return Tenant.objects.filter(is_active=True)

    @staticmethod
    def get_tenant_or_404(tenant_id, user):
        """Get tenant with permission check"""
        from django.shortcuts import get_object_or_404
        from users.models import User

        tenant = get_object_or_404(Tenant, id=tenant_id)

        if user.role == User.SUPER_ADMIN:
            return tenant
        elif user.role == User.OWNER and tenant.owner == user:
            return tenant
        elif user.role == User.STAFF and tenant.is_active:
            return tenant

        raise PermissionError("You don't have permission to access this tenant")
