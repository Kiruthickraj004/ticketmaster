from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        OPERATOR = "OPERATOR", "Bus Operator"
        ADMIN = "ADMIN", "Administrator"

    class ApprovalStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    is_approved = models.BooleanField(
        default=True,
        help_text="Designates whether this user/operator is approved to log in.",
    )
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.APPROVED,
    )

    @property
    def operator_profile(self):
        return getattr(self, "organizer_profile", None)

    def save(self, *args, **kwargs):
        if self.is_superuser and self.role != self.Role.ADMIN:
            self.role = self.Role.ADMIN

        # Keep is_approved and approval_status strictly synchronized
        if self.role == self.Role.OPERATOR:
            if self.approval_status == self.ApprovalStatus.APPROVED:
                self.is_approved = True
            elif self.approval_status in [self.ApprovalStatus.PENDING, self.ApprovalStatus.REJECTED]:
                self.is_approved = False
            elif self.is_approved:
                self.approval_status = self.ApprovalStatus.APPROVED
            else:
                self.approval_status = self.ApprovalStatus.PENDING
        else:
            self.is_approved = True
            self.approval_status = self.ApprovalStatus.APPROVED

        if "update_fields" in kwargs and kwargs["update_fields"] is not None:
            kwargs["update_fields"] = set(kwargs["update_fields"]) | {"is_approved", "approval_status"}

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


class OrganizerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="organizer_profile",
    )
    organization_name = models.CharField(max_length=150)
    contact_number = models.CharField(max_length=20)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Bus Operator Profile"
        verbose_name_plural = "Bus Operator Profiles"

    def __str__(self):
        return self.organization_name


OperatorProfile = OrganizerProfile
