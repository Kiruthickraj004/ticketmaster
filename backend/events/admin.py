from django.contrib import admin

from .models import Venue, Seat, Event, Booking


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "capacity",
    )
    search_fields = (
        "name",
        "city",
    )


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = (
        "venue",
        "row",
        "seat_number",
    )
    list_filter = (
        "venue",
        "row",
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "organizer",
        "venue",
        "date",
        "ticket_price",
        "status",
    )

    list_filter = (
        "status",
        "date",
        "venue",
    )

    search_fields = (
        "name",
        "organizer__username",
        "venue__name",
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "customer",
        "event",
        "seat",
        "status",
        "booked_at",
    )

    list_filter = (
        "status",
        "event",
    )

    search_fields = (
        "customer__username",
        "event__name",
        "seat__row",
    )