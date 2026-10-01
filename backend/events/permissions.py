from rest_framework.permissions import BasePermission

from users.models import User


class IsOrganizer(BasePermission):
    message = "Only event organizers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.ORGANIZER
        )


class IsCustomer(BasePermission):
    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.CUSTOMER
        )