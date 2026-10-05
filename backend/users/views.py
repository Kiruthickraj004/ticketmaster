from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)


class IsAdminUserOrRole(BasePermission):
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.is_superuser
                or request.user.role == User.Role.ADMIN
            )
        )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_data = UserSerializer(user).data

        if user.role == User.Role.OPERATOR:
            msg = (
                "Bus operator registration request submitted successfully! "
                "Your account is pending administrator approval. "
                "You will be able to log in once an admin accepts your request."
            )
        else:
            msg = "Account registered successfully! You can now log in."

        return Response(
            {
                "user": user_data,
                "detail": msg,
                "is_approved": user.is_approved,
                "approval_status": user.approval_status,
            },
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class OperatorRequestsListView(generics.ListAPIView):
    """Allows admins to list all operator registration requests and filter by status."""
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserOrRole]

    def get_queryset(self):
        status_param = self.request.query_params.get("status")
        qs = User.objects.filter(
            role=User.Role.OPERATOR
        ).select_related("organizer_profile").order_by("-date_joined")

        if status_param and status_param.upper() != "ALL":
            qs = qs.filter(approval_status=status_param.upper())
        return qs


class OperatorRequestActionView(generics.GenericAPIView):
    """Allows admins to accept (approve) or reject an operator registration request."""
    permission_classes = [IsAdminUserOrRole]

    def post(self, request, user_id):
        user = get_object_or_404(
            User,
            id=user_id,
            role=User.Role.OPERATOR,
        )

        action = request.data.get("action", "").strip().lower()

        if action in ["approve", "accept"]:
            user.is_approved = True
            user.approval_status = User.ApprovalStatus.APPROVED
            user.save(update_fields=["is_approved", "approval_status"])
            return Response(
                {
                    "detail": f"Bus Operator '{user.username}' has been successfully approved! They can now log in.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        elif action in ["reject", "decline"]:
            user.is_approved = False
            user.approval_status = User.ApprovalStatus.REJECTED
            user.save(update_fields=["is_approved", "approval_status"])
            return Response(
                {
                    "detail": f"Bus Operator '{user.username}' registration request has been rejected.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"detail": "Invalid action. Allowed values are 'approve' or 'reject'."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class OperatorStatusCheckView(generics.GenericAPIView):
    """Allows applicant bus operators to check their account approval status using username or email."""
    permission_classes = [AllowAny]

    def post(self, request):
        query = request.data.get("identifier", "").strip()
        if not query:
            return Response(
                {"detail": "Please provide your username or email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(
            Q(username__iexact=query) | Q(email__iexact=query),
            role=User.Role.OPERATOR,
        ).select_related("organizer_profile").first()

        if not user:
            return Response(
                {
                    "detail": "No bus operator account found with this username or email. Please verify spelling."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        org_name = ""
        if hasattr(user, "organizer_profile") and user.organizer_profile:
            org_name = user.organizer_profile.organization_name

        approval_status = user.approval_status
        is_approved = user.is_approved

        if approval_status == User.ApprovalStatus.APPROVED or is_approved:
            message = "Congratulations! Your bus operator account has been approved by the administrator. You can now sign in to access your operator dashboard."
        elif approval_status == User.ApprovalStatus.REJECTED:
            message = "Your bus operator registration request was rejected by the administrator. Please contact support if you need further information."
        else:
            message = "Your operator registration is currently under review by the administrator. You will be able to log in as soon as it is approved."

        return Response(
            {
                "username": user.username,
                "email": user.email,
                "organization_name": org_name,
                "approval_status": approval_status,
                "is_approved": is_approved,
                "registered_on": user.date_joined.isoformat(),
                "message": message,
            },
            status=status.HTTP_200_OK,
        )
