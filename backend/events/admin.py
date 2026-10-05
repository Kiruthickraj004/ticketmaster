from django.contrib import admin
from .models import Booking, Event


@admin.register(Event)
class BusTripAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "bus_number",
        "bus_type",
        "source",
        "destination",
        "date",
        "time",
        "ticket_price",
        "seats_availability",
        "organizer",
        "status",
    )

    list_filter = (
        "status",
        "bus_type",
        "source",
        "destination",
        "date",
    )

    search_fields = (
        "name",
        "bus_number",
        "source",
        "destination",
        "organizer__username",
    )

    ordering = ("-date", "-time")

    @admin.display(description="Available / Total Seats")
    def seats_availability(self, obj):
        return f"{obj.available_seats_count} / {obj.total_seats}"


@admin.register(Booking)
class BusBookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "bus_trip",
        "ticket_count",
        "allocated_seats",
        "passengers",
        "total_price",
        "status",
        "booked_at",
    )

    list_filter = (
        "status",
        "event__source",
        "event__destination",
        "booked_at",
    )

    search_fields = (
        "customer__username",
        "customer__email",
        "event__name",
        "contact_phone",
        "contact_email",
    )

    ordering = ("-booked_at",)

    @admin.display(description="Bus Trip Route")
    def bus_trip(self, obj):
        return f"{obj.event.name} ({obj.event.source} → {obj.event.destination})"

    @admin.display(description="Seats")
    def allocated_seats(self, obj):
        seats = obj.get_seat_numbers()
        return ", ".join(seats) if seats else "-"

    @admin.display(description="Passengers")
    def passengers(self, obj):
        passengers = obj.get_passenger_names()
        return ", ".join(passengers) if passengers else "-"