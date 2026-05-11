from django.db import models
from common.models import BaseModel
from tenants.models import Tenant

class Customer(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='customers')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    debt_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    visit_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('tenant', 'phone')

    def __str__(self):
        return f"{self.full_name} ({self.phone})"
