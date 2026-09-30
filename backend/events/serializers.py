from rest_framework import serializers

from .models import Event, Booking, Seat


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "description",
            "venue",
            "date",
            "time",
            "ticket_price",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "event",
            "seat",
            "status",
            "booked_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "booked_at",
        ]

    def validate(self, attrs):
        event = attrs["event"]
        seat = attrs["seat"]

        if event.status != Event.Status.PUBLISHED:
            raise serializers.ValidationError(
                "You can only book published events."
            )

        if seat.venue_id != event.venue_id:
            raise serializers.ValidationError(
                "This seat does not belong to the event venue."
            )

        if Booking.objects.filter(
            event=event,
            seat=seat,
            status=Booking.Status.CONFIRMED,
        ).exists():
            raise serializers.ValidationError(
                "This seat is already booked."
            )

        return attrs


class EventSeatSerializer(serializers.ModelSerializer):
    seat = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = [
            "id",
            "seat",
            "status",
        ]

    def get_seat(self, obj):
        return f"{obj.row}{obj.seat_number}"

    def get_status(self, obj):
        event = self.context["event"]

        is_booked = Booking.objects.filter(
            event=event,
            seat=obj,
            status=Booking.Status.CONFIRMED,
        ).exists()

        return (
            "BOOKED"
            if is_booked
            else "AVAILABLE"
        )


class OrganizerBookingSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(
        source="customer.username",
        read_only=True,
    )
    event_name = serializers.CharField(
        source="event.name",
        read_only=True,
    )
    seat_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "customer_username",
            "event_name",
            "seat_name",
            "status",
            "booked_at",
        ]

    def get_seat_name(self, obj):
        return f"{obj.seat.row}{obj.seat.seat_number}"