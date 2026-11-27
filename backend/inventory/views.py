
from django.db import models
from django.db.models import Sum

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import (
    ProductPermission,
    ManagementPermission,
    TransactionPermission,
)

from .models import Category, Product, StockTransaction

from .serializers import (
    CategorySerializer,
    ProductSerializer,
    StockTransactionSerializer,
)

from .services import create_stock_transaction


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [ManagementPermission]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]

    ordering = ["name"]


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related(
        "category",
        "supplier"
    ).all()

    serializer_class = ProductSerializer
    permission_classes = [ProductPermission]

    filterset_fields = [
        "category",
        "supplier",
        "is_active",
    ]

    search_fields = [
        "name",
        "sku",
        "description",
    ]

    ordering_fields = [
        "name",
        "cost_price",
        "selling_price",
        "stock_quantity",
        "created_at",
    ]

    ordering = ["name"]

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        products = self.get_queryset().filter(
            is_active=True,
            stock_quantity__lte=models.F("reorder_level")
        )

        serializer = self.get_serializer(products, many=True)

        return Response(serializer.data)


class StockTransactionViewSet(ModelViewSet):
    queryset = StockTransaction.objects.select_related(
        "product",
        "created_by"
    ).all()

    serializer_class = StockTransactionSerializer
    permission_classes = [TransactionPermission]

    filterset_fields = [
        "product",
        "transaction_type",
        "created_by",
    ]

    search_fields = [
        "product__name",
        "note",
        "created_by__username",
    ]

    ordering_fields = [
        "quantity",
        "created_at",
        "transaction_type",
    ]

    ordering = ["-created_at"]

    # Prevent editing or deleting historical transactions.
    http_method_names = ["get", "post", "head", "options"]

    def perform_create(self, serializer):
        data = serializer.validated_data

        transaction_record = create_stock_transaction(
            product_id=data["product"].id,
            transaction_type=data["transaction_type"],
            quantity=data["quantity"],
            user=self.request.user,
            note=data.get("note", "")
        )

        serializer.instance = transaction_record


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_products = Product.objects.filter(
            is_active=True
        ).count()

        total_categories = Category.objects.count()

        total_suppliers = Product.objects.values(
            "supplier"
        ).exclude(
            supplier__isnull=True
        ).distinct().count()

        low_stock_count = Product.objects.filter(
            is_active=True,
            stock_quantity__lte=models.F("reorder_level")
        ).count()

        total_stock_units = Product.objects.filter(
            is_active=True
        ).aggregate(
            total=Sum("stock_quantity")
        )["total"] or 0

        recent_transactions = StockTransaction.objects.select_related(
            "product",
            "created_by"
        ).order_by("-created_at")[:5]

        recent_transactions_data = StockTransactionSerializer(
            recent_transactions,
            many=True
        ).data

        return Response({
            "total_products": total_products,
            "total_categories": total_categories,
            "total_suppliers": total_suppliers,
            "low_stock_count": low_stock_count,
            "total_stock_units": total_stock_units,
            "recent_transactions": recent_transactions_data,
        })
