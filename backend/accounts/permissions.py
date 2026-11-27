
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.groups.filter(name="Admin").exists()
            )
        )

class IsManager(BasePermission):
    message = "Only managers and administrators can perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return (
            request.user.is_superuser
            or request.user.groups.filter(
                name__in=["Admin", "Manager"]
            ).exists()
        )

class IsStaff(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return (
            request.user.is_superuser
            or request.user.groups.filter(
                name__in=["Admin", "Manager", "Staff"]
            ).exists()
        )
        

class ProductPermission(BasePermission):
    """
    Admin:
        View, create, update and delete products.

    Manager:
        View, create and update products.

    Staff:
        View products only.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Superusers have complete access.
        if user.is_superuser:
            return True

        # All three roles can view products.
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return user.groups.filter(
                name__in=["Admin", "Manager", "Staff"]
            ).exists()

        # Admin and Manager can create or update products.
        if request.method in ("POST", "PUT", "PATCH"):
            return user.groups.filter(
                name__in=["Admin", "Manager"]
            ).exists()

        # Only Admin can delete products.
        if request.method == "DELETE":
            return user.groups.filter(name="Admin").exists()

        return False


class ManagementPermission(BasePermission):
    """
    Admin:
        Full access.

    Manager:
        View, create and update.

    Staff:
        View only.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if request.method in ("GET", "HEAD", "OPTIONS"):
            return user.groups.filter(
                name__in=["Admin", "Manager", "Staff"]
            ).exists()

        if request.method in ("POST", "PUT", "PATCH"):
            return user.groups.filter(
                name__in=["Admin", "Manager"]
            ).exists()

        if request.method == "DELETE":
            return user.groups.filter(name="Admin").exists()

        return False




class TransactionPermission(BasePermission):
    """
    All assigned roles can view and record transactions.

    Historical transactions cannot be edited or deleted.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if request.method in ("GET", "HEAD", "OPTIONS", "POST"):
            return user.groups.filter(
                name__in=["Admin", "Manager", "Staff"]
            ).exists()

        return False