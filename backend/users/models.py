from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        ORGANIZER = "ORGANIZER", "Event Organizer"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )

    def __str__(self):
        return self.username


class OrganizerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="organizer_profile",
    )
    organization_name = models.CharField(max_length=150)
    contact_number = models.CharField(max_length=20)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.organization_name