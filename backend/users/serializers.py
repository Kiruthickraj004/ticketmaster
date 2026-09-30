from django.db import transaction
from rest_framework import serializers

from .models import User, OrganizerProfile


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
        if value not in [
            User.Role.CUSTOMER,
            User.Role.ORGANIZER,
        ]:
            raise serializers.ValidationError(
                "Invalid role."
            )

        return value

    def validate(self, attrs):
        role = attrs.get("role")

        if role == User.Role.ORGANIZER:
            required_fields = [
                "organization_name",
                "contact_number",
            ]

            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({
                        field: f"{field.replace('_', ' ').title()} is required for organizers."
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

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        if user.role == User.Role.ORGANIZER:
            OrganizerProfile.objects.create(
                user=user,
                organization_name=organization_name,
                contact_number=contact_number,
                description=description,
            )

        return user