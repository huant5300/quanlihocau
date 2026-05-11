from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Session, SessionProduct, FishingPackage, Hut
from .serializers import SessionSerializer, SessionProductSerializer, FishingPackageSerializer, HutSerializer
from customer.models import Customer
from product.models import Product
from fish.models import FishBuyback, FishType
from tenants.models import Tenant
from payment.models import Payment

class FishingPackageViewSet(viewsets.ModelViewSet):
    queryset = FishingPackage.objects.all()
    serializer_class = FishingPackageSerializer

class HutViewSet(viewsets.ModelViewSet):
    queryset = Hut.objects.all()
    serializer_class = HutSerializer

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def create(self, request, *args, **kwargs):
        tenant = Tenant.objects.first()
        data = request.data
        customer = None
        if data.get('phone') and data.get('customer_name'):
            customer, _ = Customer.objects.get_or_create(
                phone=data['phone'],
                defaults={'full_name': data['customer_name'], 'tenant': tenant}
            )

        session = Session.objects.create(
            tenant=tenant,
            customer=customer,
            hut_number=data.get('hut_number', ''),
            start_time=data.get('start_time'),
            end_time=data.get('end_time'),
            total_amount=data.get('total_amount', 0),
            status='ACTIVE'
        )

        products_data = data.get('products', [])
        for prod_data in products_data:
            try:
                p_id = prod_data.get('product_id') or prod_data.get('id')
                product = Product.objects.get(id=p_id)
                SessionProduct.objects.create(
                    session=session,
                    product=product,
                    quantity=prod_data['quantity'],
                    price_at_time=product.price
                )
                product.stock -= prod_data['quantity']
                product.save()
            except Product.DoesNotExist:
                pass

        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        from decimal import Decimal
        from datetime import timedelta
        session = self.get_object()
        hours = Decimal(str(request.data.get('hours', 0)))
        cost = Decimal(str(request.data.get('cost', 0)))
        
        # Extend end_time
        if session.end_time:
            session.end_time = session.end_time + timedelta(hours=float(hours))
            
        session.total_amount = Decimal(str(session.total_amount)) + cost
        session.save()
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        session = self.get_object()
        session.status = 'COMPLETED'
        payment_method = request.data.get('method', 'CASH')
        payment_amount = request.data.get('amount', session.total_amount)
        
        Payment.objects.create(
            tenant=session.tenant,
            session=session,
            amount=payment_amount,
            method=payment_method
        )
        
        if session.customer:
            session.customer.total_spent += payment_amount
            session.customer.visit_count += 1
            session.customer.save()

        session.save()
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def buyback(self, request, pk=None):
        from decimal import Decimal
        session = self.get_object()
        weight = Decimal(str(request.data.get('weight', 0)))
        price_per_kg = Decimal(str(request.data.get('price_per_kg', 0)))
        total_price = weight * price_per_kg
        
        # We need a FishType for FishBuyback.
        fish_type = FishType.objects.filter(tenant=session.tenant).first()
        if not fish_type:
            fish_type = FishType.objects.create(tenant=session.tenant, name='Cá tạp', buyback_price_per_kg=price_per_kg)
            
        FishBuyback.objects.create(
            tenant=session.tenant,
            session=session,
            fish_type=fish_type,
            weight=weight,
            price_per_kg=price_per_kg,
            total_price=total_price
        )
        
        # Deduct from total amount
        session.discount_amount = Decimal(str(session.discount_amount)) + total_price
        session.total_amount = Decimal(str(session.total_amount)) - total_price
        session.save()
        
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def add_products(self, request, pk=None):
        from decimal import Decimal
        session = self.get_object()
        products_data = request.data.get('products', [])
        added_amount = Decimal('0')
        for prod_data in products_data:
            try:
                p_id = prod_data.get('product_id') or prod_data.get('id')
                product = Product.objects.get(id=p_id)
                SessionProduct.objects.create(
                    session=session,
                    product=product,
                    quantity=prod_data['quantity'],
                    price_at_time=product.price
                )
                product.stock -= prod_data['quantity']
                product.save()
                added_amount += Decimal(str(product.price)) * Decimal(str(prod_data['quantity']))
            except Product.DoesNotExist:
                pass
                
        session.total_amount = Decimal(str(session.total_amount)) + added_amount
        session.save()
        return Response(SessionSerializer(session).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.utils import timezone
        from django.db.models import Sum
        today = timezone.now().date()
        
        active_count = Session.objects.filter(status='ACTIVE').count()
        today_sessions = Session.objects.filter(status='COMPLETED', updated_at__date=today)
        today_revenue = today_sessions.aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Calculate product revenue for today
        product_revenue = SessionProduct.objects.filter(
            session__in=today_sessions
        ).aggregate(total=Sum(models.F('quantity') * models.F('price_at_time')))['total'] or 0
        
        session_revenue = today_revenue - product_revenue
        
        customer_count = Customer.objects.count()
        low_stock_count = Product.objects.filter(stock__lte=10).count()
        
        return Response({
            "activeCount": active_count,
            "todayRevenue": float(today_revenue),
            "sessionRevenue": float(session_revenue),
            "productRevenue": float(product_revenue),
            "customerCount": customer_count,
            "lowStockCount": low_stock_count
        })

class SessionProductViewSet(viewsets.ModelViewSet):
    queryset = SessionProduct.objects.all()
    serializer_class = SessionProductSerializer

@api_view(['GET', 'PATCH'])
def lake_info(request):
    tenant = Tenant.objects.first()
    if request.method == 'GET':
        return Response({
            "name": tenant.name if tenant else "Fishing Pond",
            "address": tenant.address if tenant else "Localhost",
            "phone": tenant.phone if tenant else "0000000000",
            "receipt_footer": "Cảm ơn quý khách!"
        })
    if request.method == 'PATCH':
        if not tenant:
            return Response({"error": "No tenant found"}, status=404)
        tenant.name = request.data.get('name', tenant.name)
        tenant.address = request.data.get('address', tenant.address)
        tenant.phone = request.data.get('phone', tenant.phone)
        tenant.save()
        return Response({
            "name": tenant.name,
            "address": tenant.address,
            "phone": tenant.phone,
            "receipt_footer": "Cảm ơn quý khách!"
        })
    return Response({"error": "Method not allowed"}, status=405)
