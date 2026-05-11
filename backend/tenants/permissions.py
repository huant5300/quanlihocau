from rest_framework import permissions
from users.models import User


class IsOwnerOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or super admins to access it.
    """

    def has_object_permission(self, request, view, obj):
        # Super admins can access everything
        if request.user.role == User.SUPER_ADMIN:
            return True

        # Owners can access their own tenants
        if request.user.role == User.OWNER:
            return obj.owner == request.user

        # Staff cannot access tenant operations
        return False


class CanCreateTenant(permissions.BasePermission):
    """
    Only owners and super admins can create tenants.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.role in [User.SUPER_ADMIN, User.OWNER]


class TenantPermission(permissions.BasePermission):
    """
    Comprehensive permission class for tenant operations.
    """

    def has_permission(self, request, view):
        # All authenticated users can list/view
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        # Only owners and super admins can create
        if request.method == 'POST':
            return request.user.role in [User.SUPER_ADMIN, User.OWNER]

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Super admins can do anything
        if request.user.role == User.SUPER_ADMIN:
            return True

        # Owners can access their own tenants
        if request.user.role == User.OWNER:
            return obj.owner == request.user

        # Staff can only view active tenants
        if request.method in permissions.SAFE_METHODS:
            return obj.is_active

        return False
