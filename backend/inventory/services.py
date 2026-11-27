
from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import Product, StockTransaction


@transaction.atomic
def create_stock_transaction(
    *,
    product_id,
    transaction_type,
    quantity,
    user,
    note=""
):
    # Validate transaction quantity.
    if quantity <= 0:
        raise ValidationError({
            "quantity": "Quantity must be greater than zero."
        })

    # Lock the product row to prevent concurrent stock updates.
    try:
        product = Product.objects.select_for_update().get(
            id=product_id
        )
    except Product.DoesNotExist:
        raise ValidationError({
            "product": "Product does not exist."
        })

    # Calculate the new stock quantity.
    if transaction_type == StockTransaction.TransactionType.STOCK_IN:
        new_stock = product.stock_quantity + quantity

    elif transaction_type == StockTransaction.TransactionType.STOCK_OUT:
        if quantity > product.stock_quantity:
            raise ValidationError({
                "quantity": "Insufficient stock available."
            })

        new_stock = product.stock_quantity - quantity

    elif transaction_type == StockTransaction.TransactionType.ADJUSTMENT:
        new_stock = quantity

    else:
        raise ValidationError({
            "transaction_type": "Invalid transaction type."
        })

    # Update product inventory.
    product.stock_quantity = new_stock
    product.save(update_fields=["stock_quantity", "updated_at"])

    # Record the stock transaction.
    stock_transaction = StockTransaction.objects.create(
        product=product,
        transaction_type=transaction_type,
        quantity=quantity,
        note=note,
        created_by=user
    )

    return stock_transaction
