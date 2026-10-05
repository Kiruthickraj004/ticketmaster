from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, time
from users.models import User
from .models import Venue, Seat, Event, Booking


class EventBookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.organizer = User.objects.create_user(
            username="organizer1",
            email="org@example.com",
            password="Password123!",
            role=User.Role.OPERATOR,
        )
        self.customer = User.objects.create_user(
            username="customer1",
            email="cust@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER,
        )

        self.bus_trip = Event.objects.create(
            organizer=self.organizer,
            name="Intercity Volvo Express",
            bus_number="TN-01-AB-1234",
            bus_type="AC Sleeper (2+1)",
            source="Chennai",
            destination="Coimbatore",
            description="Premium AC Volvo Sleeper service with charging and wifi.",
            date=date.today(),
            time=time(21, 30),
            arrival_date=date.today(),
            arrival_time=time(5, 30),
            ticket_price="35.00",
            total_seats=40,
            status=Event.Status.PUBLISHED,
        )

    def test_public_event_list_without_auth(self):
        # Unauthenticated request should succeed
        response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Intercity Volvo Express")
        self.assertEqual(response.data[0]["source"], "Chennai")
        self.assertEqual(response.data[0]["destination"], "Coimbatore")
        self.assertEqual(response.data[0]["available_seats_count"], 40)

    def test_public_event_seats_without_auth(self):
        response = self.client.get(f"/api/events/{self.bus_trip.id}/seats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 40)
        self.assertEqual(response.data[0]["seat"], "S1")
        self.assertEqual(response.data[0]["status"], "AVAILABLE")

    def test_booking_create_with_auto_seat_allocation(self):
        self.client.force_authenticate(user=self.customer)

        # Customer books 2 tickets without manual seat picking
        create_response = self.client.post(
            "/api/bookings/",
            {
                "event": self.bus_trip.id,
                "ticket_count": 2,
                "passenger_names": ["Kiruthick", "John Doe"],
                "contact_phone": "+1 555 123 4567",
                "contact_email": "cust@example.com",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["event_name"], "Intercity Volvo Express")
        self.assertEqual(create_response.data["ticket_count"], 2)
        # Seats S1 and S2 automatically allocated
        self.assertEqual(create_response.data["allocated_seats"], ["S1", "S2"])
        self.assertEqual(float(create_response.data["total_price"]), 70.00)

        # GET /api/bookings/
        list_response = self.client.get("/api/bookings/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["ticket_count"], 2)
        self.assertEqual(list_response.data[0]["allocated_seats"], ["S1", "S2"])

    def test_add_more_tickets_to_booking(self):
        self.client.force_authenticate(user=self.customer)

        # First book 1 ticket -> auto allots S1
        create_response = self.client.post(
            "/api/bookings/",
            {
                "event": self.bus_trip.id,
                "ticket_count": 1,
                "passenger_names": ["Kiruthick"],
            },
            format="json",
        )
        booking_id = create_response.data["id"]
        self.assertEqual(create_response.data["allocated_seats"], ["S1"])

        # Customer adds 2 more tickets to their existing booking
        add_response = self.client.post(
            f"/api/bookings/{booking_id}/add-tickets/",
            {
                "additional_tickets": 2,
                "passenger_names": ["Sarah", "Arthur"],
            },
            format="json",
        )
        self.assertEqual(add_response.status_code, status.HTTP_200_OK)
        # Should now have 3 tickets and S1, S2, S3 allotted!
        updated_booking = add_response.data["booking"]
        self.assertEqual(updated_booking["ticket_count"], 3)
        self.assertEqual(updated_booking["allocated_seats"], ["S1", "S2", "S3"])
        self.assertEqual(len(updated_booking["passenger_list"]), 3)
        self.assertEqual(float(updated_booking["total_price"]), 105.00)

    def test_cancel_booking(self):
        self.client.force_authenticate(user=self.customer)

        create_response = self.client.post(
            "/api/bookings/",
            {
                "event": self.bus_trip.id,
                "ticket_count": 2,
            },
            format="json",
        )
        booking_id = create_response.data["id"]

        cancel_response = self.client.post(f"/api/bookings/{booking_id}/cancel/")
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_response.data["booking"]["status"], "CANCELLED")

        # After cancellation, available seats count goes back to 40
        self.assertEqual(self.bus_trip.available_seats_count, 40)

    def test_partial_cancel_booking_by_count(self):
        self.client.force_authenticate(user=self.customer)

        # 1. Book 10 tickets
        passengers = [f"Passenger {i}" for i in range(1, 11)]
        create_response = self.client.post(
            "/api/bookings/",
            {
                "event": self.bus_trip.id,
                "ticket_count": 10,
                "passenger_names": passengers,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        booking_id = create_response.data["id"]
        self.assertEqual(len(create_response.data["allocated_seats"]), 10)
        self.assertEqual(self.bus_trip.available_seats_count, 30)

        # 2. Cancel 2 tickets partially
        cancel_response = self.client.post(
            f"/api/bookings/{booking_id}/cancel/",
            {"cancel_count": 2},
            format="json",
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_response.data["remaining_tickets"], 8)
        self.assertEqual(cancel_response.data["cancelled_seats"], ["S9", "S10"])
        self.assertEqual(cancel_response.data["booking"]["status"], "CONFIRMED")
        self.assertEqual(cancel_response.data["booking"]["ticket_count"], 8)
        self.assertEqual(cancel_response.data["booking"]["allocated_seats"], [f"S{i}" for i in range(1, 9)])
        self.assertEqual(float(cancel_response.data["refund_amount"]), 70.00)
        self.assertEqual(float(cancel_response.data["booking"]["total_price"]), 280.00)

        # 3. Available seats on bus increased from 30 to 32
        self.assertEqual(self.bus_trip.available_seats_count, 32)
        self.assertIn("S9", self.bus_trip.get_available_seats())
        self.assertIn("S10", self.bus_trip.get_available_seats())

    def test_partial_cancel_booking_by_specific_seats(self):
        self.client.force_authenticate(user=self.customer)

        create_response = self.client.post(
            "/api/bookings/",
            {
                "event": self.bus_trip.id,
                "ticket_count": 4,
                "passenger_names": ["P1", "P2", "P3", "P4"],
            },
            format="json",
        )
        booking_id = create_response.data["id"]
        self.assertEqual(create_response.data["allocated_seats"], ["S1", "S2", "S3", "S4"])

        # Cancel specific seat 'S2'
        cancel_response = self.client.post(
            f"/api/bookings/{booking_id}/cancel/",
            {"seat_numbers": ["S2"]},
            format="json",
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_response.data["remaining_tickets"], 3)
        self.assertEqual(cancel_response.data["cancelled_seats"], ["S2"])
        self.assertEqual(cancel_response.data["booking"]["allocated_seats"], ["S1", "S3", "S4"])
        self.assertEqual(cancel_response.data["booking"]["passenger_list"], ["P1", "P3", "P4"])
        self.assertIn("S2", self.bus_trip.get_available_seats())
