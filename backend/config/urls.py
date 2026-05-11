"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path("", views.home, name="home")
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path("", Home.as_view(), name="home")
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path("blog/", include("blog.urls"))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Fishing Pond SaaS API",
        default_version="v1",
        description="API documentation for Fishing Pond Management SaaS.\n\nTo use JWT authentication, click on the **Authorize** button and enter: `Bearer <your_token>`",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@fishingpond.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

from . import report_views
from users.views import GoogleLogin

urlpatterns = [
    path("admin/", admin.site.urls),
    
    re_path(r"^swagger(?P<format>\.json|\.yaml)$", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    re_path(r"^swagger/$", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    re_path(r"^redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/tenants/", include("tenants.urls")),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/customers/", include("customer.urls")),
    path("api/v1/products/", include("product.urls")),
    path("api/v1/tickets/", include("ticket.urls")),
    path("api/v1/fish/", include("fish.urls")),
    path("api/v1/payments/", include("payment.urls")),
    path("api/v1/settings/", include("ticket.urls")),
    
    # Reports
    path("api/v1/reports/revenue/", report_views.revenue_stats),
    path("api/v1/reports/popular-products/", report_views.popular_products),
    path("api/v1/reports/top-customers/", report_views.top_customers),
    path("api/v1/reports/export/", report_views.export_data),

    # Google OAuth & Auth routes
    path('accounts/', include('allauth.urls')),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('dj-rest-auth/google/', GoogleLogin.as_view(), name='google_login_rest'),
]
