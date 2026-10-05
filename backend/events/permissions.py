from rest_framework.permissions import BasePermission

from users.models import User


class IsOperator(BasePermission):
    message = "Only approved bus operators can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.OPERATOR
            and getattr(request.user, "is_approved", True)
        )


IsOrganizer = IsOperator



class IsCustomer(BasePermission):
    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.CUSTOMER
        )