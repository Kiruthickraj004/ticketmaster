from django.db import transaction
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, OrganizerProfile


class OrganizerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerProfile
        fields = [
            "organization_name",
            "contact_number",
            "description",
        ]


OperatorProfileSerializer = OrganizerProfileSerializer


class UserSerializer(serializers.ModelSerializer):
    organizer_profile = serializers.SerializerMethodField()
    operator_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_approved",
            "approval_status",
            "is_staff",
            "is_superuser",
            "date_joined",
            "organizer_profile",
            "operator_profile",
        ]

    def get_organizer_profile(self, obj):
        if hasattr(obj, "organizer_profile"):
            profile = obj.organizer_profile
            return {
                "organization_name": profile.organization_name,
                "contact_number": profile.contact_number,
                "description": profile.description,
            }
        return None

    def get_operator_profile(self, obj):
        return self.get_organizer_profile(obj)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        password = attrs.get("password")

        if username_or_email and password:
            user = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")

                # Check operator approval status
                if user.role == User.Role.OPERATOR:
                    if getattr(user, "approval_status", "") == User.ApprovalStatus.REJECTED:
                        raise serializers.ValidationError(
                            "Your bus operator registration request was declined by an administrator."
                        )

                    # If marked approved by either flag, allow login and ensure both flags stay synced
                    if getattr(user, "approval_status", "") == User.ApprovalStatus.APPROVED or getattr(user, "is_approved", False):
                        if not user.is_approved or user.approval_status != User.ApprovalStatus.APPROVED:
                            user.is_approved = True
                            user.approval_status = User.ApprovalStatus.APPROVED
                            user.save()
                    else:
                        raise serializers.ValidationError(
                            "Your bus operator account registration is pending administrator approval. You will be able to log in once an admin accepts your request."
                        )

                attrs[self.username_field] = user.get_username()

        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class RegisterSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    contact_number = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
            "organization_name",
            "contact_number",
            "description",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate_role(self, value):
        val = str(value).upper()
        if val not in [
            User.Role.CUSTOMER,
            User.Role.OPERATOR,
        ]:
            raise serializers.ValidationError(
                "Invalid role. Role must be CUSTOMER or OPERATOR."
            )

        return val

    def validate(self, attrs):
        role = attrs.get("role")
        if role == User.Role.OPERATOR:
            required_fields = [
                "organization_name",
                "contact_number",
            ]

            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({
                        field: f"{field.replace('_', ' ').title()} is required for bus operators."
                    })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        organization_name = validated_data.pop(
            "organization_name",
            None,
        )
        contact_number = validated_data.pop(
            "contact_number",
            None,
        )
        description = validated_data.pop(
            "description",
            "",
        )

        password = validated_data.pop("password")
        role = validated_data.get("role", User.Role.CUSTOMER)

        # If operator, set to pending approval
        if role == User.Role.OPERATOR:
            validated_data["is_approved"] = False
            validated_data["approval_status"] = User.ApprovalStatus.PENDING
        else:
            validated_data["is_approved"] = True
            validated_data["approval_status"] = User.ApprovalStatus.APPROVED

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        if user.role == User.Role.OPERATOR:
            OrganizerProfile.objects.create(
                user=user,
                organization_name=organization_name,
                contact_number=contact_number,
                description=description,
            )

        return user