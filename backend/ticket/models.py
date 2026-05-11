from django.db import models
from common.models import BaseModel
from tenants.models import Tenant
from customer.models import Customer
from product.models import Product

class Hut(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='huts')
    number = models.CharField(max_length=50)
    name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, default='Available') # Available, Occupied, Maintenance

    def __str__(self):
        return f"Hut {self.number}"

class FishingPackage(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='fishing_packages')
    name = models.CharField(max_length=255)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2) # e.g. 2.5
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.duration_hours}h"

class Session(BaseModel):
    STATUS_CHOICES = (
        ('ACTIVE', 'ACTIVE'),
        ('WARNING', 'WARNING'),
        ('EXPIRED', 'EXPIRED'),
        ('COMPLETED', 'COMPLETED'),
    )

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='sessions')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
    hut_number = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Financial fields for checkout
    temporary_payment = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Session {self.hut_number} - {self.customer.full_name if self.customer else 'Khách lẻ'}"

class SessionProduct(BaseModel):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='session_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.session.hut_number}"
