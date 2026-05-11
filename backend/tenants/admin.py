from django.contrib import admin
from .models import Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'timezone', 'currency', 'created_at']
    search_fields = ['name', 'phone', 'address', 'owner__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'phone', 'address', 'logo')
        }),
        ('Settings', {
            'fields': ('timezone', 'currency', 'is_active')
        }),
        ('Ownership', {
            'fields': ('owner',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
