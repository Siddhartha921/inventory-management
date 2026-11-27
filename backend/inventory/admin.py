
from django.contrib import admin
from .models import Category, Product, StockTransaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "sku",
        "category",
        "supplier",
        "cost_price",
        "selling_price",
        "stock_quantity",
        "is_active",
    )

    list_filter = ("category", "supplier", "is_active")
    search_fields = ("name", "sku")
    ordering = ("name",)


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "transaction_type",
        "quantity",
        "created_by",
        "created_at",
    )

    list_filter = ("transaction_type", "created_at")
    search_fields = ("product__name", "product__sku", "note")
    ordering = ("-created_at",)

    readonly_fields = ("created_at",)
