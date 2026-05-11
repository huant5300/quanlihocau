import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

from common.models import BaseModel


class User(AbstractUser, BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = (
        ('SUPER_ADMIN', 'SUPER_ADMIN'),
        ('OWNER', 'OWNER'),
        ('STAFF', 'STAFF'),
        ('CASHIER', 'CASHIER'),
    )

    google_id = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='STAFF')
    avatar = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    REQUIRED_FIELDS = ['email']