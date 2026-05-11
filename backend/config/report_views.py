from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from ticket.models import Session, SessionProduct
from customer.models import Customer
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_stats(request):
    # Get last 7 days
    end_date = timezone.now()
    start_date = end_date - timedelta(days=7)
    
    sessions = Session.objects.filter(
        status='COMPLETED', 
        created_at__gte=start_date
    ).annotate(date=TruncDate('created_at')) \
     .values('date') \
     .annotate(revenue=Sum('total_amount')) \
     .order_by('date')
     
    # Format for frontend
    days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"]
    result = []
    
    # Fill in all 7 days
    for i in range(6, -1, -1):
        d = end_date - timedelta(days=i)
        date_obj = d.date()
        
        rev = 0
        for s in sessions:
            if s['date'] == date_obj:
                rev = s['revenue']
                break
                
        result.append({
            "name": days[date_obj.weekday()],
            "revenue": rev
        })

    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def popular_products(request):
    top_prods = SessionProduct.objects.values('product__id', 'product__name') \
        .annotate(quantity=Sum('quantity')) \
        .order_by('-quantity')[:5]
        
    result = [
        {"id": p['product__id'], "name": p['product__name'], "quantity": p['quantity']} 
        for p in top_prods
    ]
    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_customers(request):
    top_custs = Customer.objects.order_by('-total_spent')[:5]
    result = [
        {"id": c.id, "name": c.full_name, "spent": c.total_spent}
        for c in top_custs
    ]
    return Response(result)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data(request):
    import csv
    from django.http import HttpResponse
    
    export_type = request.query_params.get('type', 'revenue')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="export_{export_type}.csv"'
    
    writer = csv.writer(response)
    
    if export_type == 'revenue':
        writer.writerow(['Date', 'Revenue'])
        sessions = Session.objects.filter(status='COMPLETED').annotate(date=TruncDate('created_at')) \
            .values('date').annotate(revenue=Sum('total_amount')).order_by('-date')
        for s in sessions:
            writer.writerow([s['date'], s['revenue']])
    elif export_type == 'customers':
        writer.writerow(['Name', 'Phone', 'Total Spent', 'Visits'])
        customers = Customer.objects.all().order_by('-total_spent')
        for c in customers:
            writer.writerow([c.full_name, c.phone, c.total_spent, c.visit_count])
            
    return response
