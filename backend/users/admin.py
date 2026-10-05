from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html

from .models import User, OrganizerProfile


class OperatorProfileAdminForm(forms.ModelForm):
    approval_status = forms.ChoiceField(
        choices=User.ApprovalStatus.choices,
        label="Application Approval Status",
        help_text="Set to 'Approved' to allow the bus operator to sign in to the platform.",
    )

    class Meta:
        model = OrganizerProfile
        fields = [
            "organization_name",
            "contact_number",
            "description",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, "user") and self.instance.user:
            self.fields["approval_status"].initial = self.instance.user.approval_status

    def save(self, commit=True):
        instance = super().save(commit=commit)
        new_status = self.cleaned_data.get("approval_status")
        if instance.user and new_status:
            instance.user.approval_status = new_status
            instance.user.is_approved = (new_status == User.ApprovalStatus.APPROVED)
            instance.user.save()
        return instance


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "role",
        "approval_status",
        "is_approved",
        "is_staff",
        "date_joined",
    )
    list_filter = (
        "role",
        "approval_status",
        "is_approved",
        "is_staff",
        "is_superuser",
        "date_joined",
    )
    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Role & Operator Approval",
            {
                "fields": (
                    "role",
                    "approval_status",
                    "is_approved",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Role & Operator Approval",
            {
                "fields": (
                    "role",
                    "approval_status",
                    "is_approved",
                )
            },
        ),
    )


@admin.register(OrganizerProfile)
class OperatorProfileAdmin(admin.ModelAdmin):
    form = OperatorProfileAdminForm
    list_display = (
        "organization_name",
        "operator_username",
        "operator_email",
        "contact_number",
        "approval_status_badge",
        "login_allowed",
        "registered_on",
    )
    list_filter = (
        "user__approval_status",
        "user__is_approved",
        "user__date_joined",
    )
    search_fields = (
        "organization_name",
        "user__username",
        "user__email",
        "contact_number",
        "description",
    )
    ordering = ("-user__date_joined",)

    readonly_fields = (
        "operator_username",
        "operator_email",
        "approval_status_badge",
        "registered_on",
    )

    fieldsets = (
        (
            "Operator Details",
            {
                "fields": (
                    "organization_name",
                    "operator_username",
                    "operator_email",
                    "contact_number",
                    "description",
                    "registered_on",
                )
            },
        ),
        (
            "Account Approval & Access",
            {
                "fields": (
                    "approval_status",
                    "approval_status_badge",
                ),
                "description": (
                    "Set approval status directly using the dropdown, or use batch actions in the operator list."
                ),
            },
        ),
    )

    actions = ["approve_operator_profiles", "reject_operator_profiles"]

    @admin.action(description="Approve selected bus operator profiles")
    def approve_operator_profiles(self, request, queryset):
        approved_count = 0
        for profile in queryset.select_related("user"):
            user = profile.user
            user.is_approved = True
            user.approval_status = User.ApprovalStatus.APPROVED
            user.save(update_fields=["is_approved", "approval_status"])
            approved_count += 1
        self.message_user(
            request,
            f"{approved_count} bus operator profile(s) successfully approved! They can now log in to the operator portal.",
        )

    @admin.action(description="Reject selected bus operator profiles")
    def reject_operator_profiles(self, request, queryset):
        rejected_count = 0
        for profile in queryset.select_related("user"):
            user = profile.user
            user.is_approved = False
            user.approval_status = User.ApprovalStatus.REJECTED
            user.save(update_fields=["is_approved", "approval_status"])
            rejected_count += 1
        self.message_user(
            request,
            f"{rejected_count} bus operator profile(s) rejected.",
        )

    @admin.display(description="Approval Status", ordering="user__approval_status")
    def approval_status_badge(self, obj):
        status = obj.user.approval_status
        colors = {
            User.ApprovalStatus.APPROVED: ("#dcfce7", "#15803d", "Approved"),
            User.ApprovalStatus.PENDING: ("#fef3c7", "#b45309", "Pending Approval"),
            User.ApprovalStatus.REJECTED: ("#fee2e2", "#b91c1c", "Rejected"),
        }
        bg, text, label = colors.get(status, ("#f1f5f9", "#475569", status))
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 3px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; text-transform: uppercase; border: 1px solid rgba(0,0,0,0.06);">{}</span>',
            bg,
            text,
            label,
        )

    @admin.display(description="Operator Username", ordering="user__username")
    def operator_username(self, obj):
        return obj.user.username

    @admin.display(description="Email", ordering="user__email")
    def operator_email(self, obj):
        return obj.user.email or "—"

    @admin.display(description="Can Log In?", boolean=True, ordering="user__is_approved")
    def login_allowed(self, obj):
        return obj.user.is_approved

    @admin.display(description="Registered On", ordering="user__date_joined")
    def registered_on(self, obj):
        return obj.user.date_joined.strftime("%b %d, %Y %H:%M")