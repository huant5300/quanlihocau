from django.db import models
from common.models import BaseModel
from tenants.models import Tenant
from ticket.models import Session

class FishType(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='fish_types')
    name = models.CharField(max_length=255)
    buyback_price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

class FishBuyback(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='fish_buybacks')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='fish_buybacks')
    fish_type = models.ForeignKey(FishType, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=6, decimal_places=2) # in kg
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Buyback {self.weight}kg {self.fish_type.name} for session {self.session.hut_number}"
