from django.contrib import admin

from .models import Booking, Event, Seat, Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "capacity")
    search_fields = ("name", "city")
    ordering = ("name",)


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ("venue", "row", "seat_number")
    list_filter = ("venue", "row")
    search_fields = ("venue__name", "row")
    ordering = ("venue", "row", "seat_number")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "organizer",
        "venue",
        "date",
        "time",
        "ticket_price",
        "status",
    )

    list_filter = (
        "status",
        "venue",
        "date",
    )

    search_fields = (
        "name",
        "organizer__username",
        "venue__name",
    )

    ordering = ("-date", "-time")


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

    ordering = ("-booked_at",)