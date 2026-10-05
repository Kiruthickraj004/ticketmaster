from rest_framework import serializers
from .models import Event, Booking, Seat, Venue


class EventSerializer(serializers.ModelSerializer):
    available_seats_count = serializers.SerializerMethodField()
    organizer_name = serializers.CharField(
        source="organizer.organizer_profile.organization_name",
        default="",
        read_only=True,
    )
    operator_name = serializers.CharField(
        source="organizer.organizer_profile.organization_name",
        default="",
        read_only=True,
    )


    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "bus_number",
            "bus_type",
            "source",
            "destination",
            "description",
            "date",
            "time",
            "arrival_date",
            "arrival_time",
            "ticket_price",
            "total_seats",
            "available_seats_count",
            "amenities",
            "boarding_point",
            "dropping_point",
            "status",
            "organizer",
            "organizer_name",
            "operator_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "organizer",
            "organizer_name",
            "operator_name",
            "available_seats_count",
            "created_at",
        ]


    def get_available_seats_count(self, obj):
        return obj.available_seats_count


class BookingSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(
        source="event.name",
        read_only=True,
    )
    bus_number = serializers.CharField(
        source="event.bus_number",
        read_only=True,
    )
    bus_type = serializers.CharField(
        source="event.bus_type",
        read_only=True,
    )
    source = serializers.CharField(
        source="event.source",
        read_only=True,
    )
    destination = serializers.CharField(
        source="event.destination",
        read_only=True,
    )
    departure_date = serializers.DateField(
        source="event.date",
        read_only=True,
    )
    departure_time = serializers.TimeField(
        source="event.time",
        read_only=True,
    )
    allocated_seats = serializers.SerializerMethodField()
    passenger_list = serializers.SerializerMethodField()
    ticket_price = serializers.DecimalField(
        source="event.ticket_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    # Backward compatibility with single seat_name
    seat_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "event",
            "event_name",
            "bus_number",
            "bus_type",
            "source",
            "destination",
            "departure_date",
            "departure_time",
            "ticket_count",
            "allocated_seats",
            "seat_name",
            "passenger_list",
            "contact_phone",
            "contact_email",
            "ticket_price",
            "total_price",
            "status",
            "booked_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "event_name",
            "bus_number",
            "bus_type",
            "source",
            "destination",
            "departure_date",
            "departure_time",
            "allocated_seats",
            "seat_name",
            "passenger_list",
            "ticket_price",
            "total_price",
            "status",
            "booked_at",
            "updated_at",
        ]

    def get_allocated_seats(self, obj):
        return obj.get_seat_numbers()

    def get_seat_name(self, obj):
        seats = obj.get_seat_numbers()
        return ", ".join(seats) if seats else "Allocated on boarding"

    def get_passenger_list(self, obj):
        return obj.get_passenger_names()

    def validate(self, attrs):
        event = attrs.get("event")
        if not event:
            raise serializers.ValidationError({"event": "Bus trip is required."})

        if event.status not in [Event.Status.PUBLISHED]:
            raise serializers.ValidationError("You can only book active scheduled bus trips.")

        ticket_count = attrs.get("ticket_count", 1)
        if ticket_count < 1:
            raise serializers.ValidationError({"ticket_count": "Must book at least 1 ticket."})

        available_count = event.available_seats_count
        if ticket_count > available_count:
            raise serializers.ValidationError(
                f"Cannot book {ticket_count} ticket(s). Only {available_count} seat(s) remaining on this bus."
            )

        return attrs

    def create(self, validated_data):
        event = validated_data["event"]
        ticket_count = validated_data.get("ticket_count", 1)
        customer = self.context["request"].user

        # Auto allocate next available seats
        available_seats = event.get_available_seats()
        if ticket_count > len(available_seats):
            raise serializers.ValidationError(
                f"Only {len(available_seats)} seats available."
            )

        allotted_seats = available_seats[:ticket_count]

        # Passenger names
        raw_passengers = self.context["request"].data.get("passenger_names", [])
        if isinstance(raw_passengers, str):
            passengers = [p.strip() for p in raw_passengers.split(",") if p.strip()]
        elif isinstance(raw_passengers, list):
            passengers = [str(p).strip() for p in raw_passengers if str(p).strip()]
        else:
            passengers = []

        # Pad with customer name or Passenger N
        while len(passengers) < ticket_count:
            idx = len(passengers) + 1
            if idx == 1:
                passengers.append(customer.get_full_name() or customer.username)
            else:
                passengers.append(f"Passenger {idx}")

        total_price = ticket_count * event.ticket_price

        booking = Booking(
            customer=customer,
            event=event,
            ticket_count=ticket_count,
            contact_phone=self.context["request"].data.get("contact_phone", ""),
            contact_email=self.context["request"].data.get("contact_email", customer.email or ""),
            total_price=total_price,
            status=Booking.Status.CONFIRMED,
        )
        booking.set_seat_numbers(allotted_seats)
        booking.set_passenger_names(passengers)
        booking.save()

        return booking


class AddTicketsSerializer(serializers.Serializer):
    additional_tickets = serializers.IntegerField(min_value=1, default=1)
    passenger_names = serializers.ListField(
        child=serializers.CharField(max_length=150),
        required=False,
        default=list,
    )


class OrganizerBookingSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(
        source="customer.username",
        read_only=True,
    )
    customer_email = serializers.CharField(
        source="customer.email",
        read_only=True,
    )
    event_name = serializers.CharField(
        source="event.name",
        read_only=True,
    )
    source = serializers.CharField(
        source="event.source",
        read_only=True,
    )
    destination = serializers.CharField(
        source="event.destination",
        read_only=True,
    )
    departure_date = serializers.DateField(
        source="event.date",
        read_only=True,
    )
    allocated_seats = serializers.SerializerMethodField()
    passenger_list = serializers.SerializerMethodField()
    seat_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "customer_username",
            "customer_email",
            "contact_phone",
            "contact_email",
            "event_name",
            "source",
            "destination",
            "departure_date",
            "ticket_count",
            "allocated_seats",
            "seat_name",
            "passenger_list",
            "total_price",
            "status",
            "booked_at",
        ]

    def get_allocated_seats(self, obj):
        return obj.get_seat_numbers()

    def get_seat_name(self, obj):
        seats = obj.get_seat_numbers()
        return ", ".join(seats) if seats else "None"

    def get_passenger_list(self, obj):
        return obj.get_passenger_names()