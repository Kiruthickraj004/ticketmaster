from django.db import models
from django.conf import settings
import json


class Venue(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=40)

    def __str__(self):
        return f"{self.name} ({self.city})"


class Seat(models.Model):
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name="seats",
        null=True,
        blank=True,
    )
    row = models.CharField(max_length=10, blank=True, default="")
    seat_number = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.row}{self.seat_number}" if self.row else f"S{self.seat_number}"


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
        limit_choices_to={"role": "OPERATOR"},
    )

    @property
    def operator(self):
        return self.organizer

    venue = models.ForeignKey(
        Venue,
        on_delete=models.SET_NULL,
        related_name="events",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)  # Operator or Bus Service name
    bus_number = models.CharField(max_length=50, blank=True, default="")
    bus_type = models.CharField(max_length=100, blank=True, default="AC Sleeper (2+1)")
    source = models.CharField(max_length=100, blank=True, default="Chennai")
    destination = models.CharField(max_length=100, blank=True, default="Coimbatore")
    description = models.TextField(blank=True, default="")
    date = models.DateField()  # Departure date
    time = models.TimeField()  # Departure time
    arrival_date = models.DateField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    ticket_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    total_seats = models.PositiveIntegerField(default=40)
    amenities = models.CharField(
        max_length=300,
        blank=True,
        default="AC, Charging Point, Reading Light, Water Bottle, WiFi",
    )
    boarding_point = models.CharField(max_length=200, blank=True, default="")
    dropping_point = models.CharField(max_length=200, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PUBLISHED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bus Trip"
        verbose_name_plural = "Bus Trips"
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.name} ({self.source} -> {self.destination})"

    def get_booked_seats(self):
        booked = set()
        for b in self.bookings.filter(status=Booking.Status.CONFIRMED):
            for s in b.get_seat_numbers():
                booked.add(s)
        return booked

    def get_all_seats(self):
        return [f"S{i}" for i in range(1, self.total_seats + 1)]

    def get_available_seats(self):
        booked = self.get_booked_seats()
        return [s for s in self.get_all_seats() if s not in booked]

    @property
    def available_seats_count(self):
        return len(self.get_available_seats())


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    seat = models.ForeignKey(
        Seat,
        on_delete=models.SET_NULL,
        related_name="bookings",
        null=True,
        blank=True,
    )
    ticket_count = models.PositiveIntegerField(default=1)
    seat_numbers = models.JSONField(default=list, blank=True)
    passenger_names = models.JSONField(default=list, blank=True)
    contact_phone = models.CharField(max_length=30, blank=True, default="")
    contact_email = models.CharField(max_length=150, blank=True, default="")
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
    )
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_seat_numbers(self):
        if isinstance(self.seat_numbers, list) and self.seat_numbers:
            return [str(s) for s in self.seat_numbers]
        if isinstance(self.seat_numbers, str) and self.seat_numbers:
            try:
                parsed = json.loads(self.seat_numbers)
                if isinstance(parsed, list):
                    return [str(s) for s in parsed]
            except Exception:
                return [s.strip() for s in self.seat_numbers.split(",") if s.strip()]
        if self.seat:
            return [f"{self.seat.row}{self.seat.seat_number}" if self.seat.row else f"S{self.seat.seat_number}"]
        return []

    def set_seat_numbers(self, seats):
        self.seat_numbers = [str(s) for s in seats]

    def get_passenger_names(self):
        if isinstance(self.passenger_names, list) and self.passenger_names:
            return [str(p) for p in self.passenger_names]
        if isinstance(self.passenger_names, str) and self.passenger_names:
            try:
                parsed = json.loads(self.passenger_names)
                if isinstance(parsed, list):
                    return [str(p) for p in parsed]
            except Exception:
                return [p.strip() for p in self.passenger_names.split(",") if p.strip()]
        return [self.customer.get_full_name() or self.customer.username]

    def set_passenger_names(self, names):
        self.passenger_names = [str(n) for n in names]

    class Meta:
        verbose_name = "Bus Ticket Booking"
        verbose_name_plural = "Bus Ticket Bookings"
        ordering = ["-booked_at"]

    @property
    def bus(self):
        return self.event

    def __str__(self):
        return f"Booking #{self.id} - {self.event.name} ({self.ticket_count} tickets)"


BusTrip = Event
BusBooking = Booking