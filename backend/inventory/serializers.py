
from rest_framework import serializers
from .models import Category, Product, StockTransaction


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
       model = Product
       fields = "__all__"
       read_only_fields = ("stock_quantity",)


class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    supplier_name = serializers.CharField(
        source="supplier.name",
        read_only=True
    )

    class Meta:
        model = Product
        fields = "__all__"



class StockTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display",
        read_only=True
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = StockTransaction
        fields = "__all__"
        read_only_fields = (
            "created_by",
            "created_at",
        )

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Transaction quantity must be greater than zero."
            )

        return value

    def validate_product(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Cannot record transactions for inactive products."
            )

        return value
