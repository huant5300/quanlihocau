from django.db import models
from common.models import BaseModel
from tenants.models import Tenant

class Product(BaseModel):
    CATEGORY_CHOICES = (
        ('BAIT', 'BAIT'),
        ('DRINK', 'DRINK'),
        ('FOOD', 'FOOD'),
        ('EQUIPMENT', 'EQUIPMENT'),
        ('OTHER', 'OTHER'),
    )

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"
