from django.db import models
from common.models import BaseModel
from tenants.models import Tenant
from ticket.models import Session

class Payment(BaseModel):
    METHOD_CHOICES = (
        ('CASH', 'CASH'),
        ('TRANSFER', 'TRANSFER'),
        ('MOMO', 'MOMO'),
        ('OTHER', 'OTHER'),
    )

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='CASH')
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payment {self.amount} {self.method} for session {self.session.hut_number}"
