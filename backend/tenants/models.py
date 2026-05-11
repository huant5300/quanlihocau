from django.db import models
import uuid
from django.conf import settings


class Tenant(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='tenant_logos/', blank=True, null=True)
    timezone = models.CharField(max_length=50, default='Asia/Ho_Chi_Minh')
    currency = models.CharField(max_length=3, default='VND')
    is_active = models.BooleanField(default=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tenants'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'owner')
        indexes = [
            models.Index(fields=['owner', 'is_active']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.owner.username})"
