import os
import django
from datetime import date, time, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from users.models import User, OrganizerProfile
from events.models import Event, Booking

organizer = User.objects.filter(role=User.Role.OPERATOR).first()
if not organizer:
    organizer = User.objects.create_user(
        username="busoperator",
        email="operator@tamilnadutravels.com",
        password="Password123!",
        role=User.Role.OPERATOR,
        is_approved=True,
        approval_status=User.ApprovalStatus.APPROVED,
    )

profile, _ = OrganizerProfile.objects.get_or_create(
    user=organizer,
    defaults={
        "organization_name": "Royal Star Travels (Tamil Nadu)",
        "contact_number": "+91 98401 23456",
        "description": "Leading intercity bus operator providing luxury, safe and on-time travel across Tamil Nadu.",
    }
)
profile.organization_name = "Royal Star Travels (Tamil Nadu)"
profile.contact_number = "+91 98401 23456"
profile.save()

# Clear out previous demo buses that were outside Tamil Nadu (Bangalore, San Francisco, New York, etc.)
Event.objects.filter(
    source__in=["Bangalore", "San Francisco", "New York", "Chicago", "Mumbai", "Hyderabad"]
).delete()
Event.objects.filter(
    destination__in=["Bangalore", "Los Angeles", "Boston", "Detroit", "Goa", "Hyderabad"]
).delete()

today = date.today()

sample_buses = [
    {
        "name": "Royal Star Volvo B11R Multi-Axle AC Sleeper",
        "bus_number": "TN-01-AB-9988",
        "bus_type": "AC Sleeper (2+1)",
        "source": "Chennai",
        "destination": "Coimbatore",
        "date": today + timedelta(days=1),
        "time": time(21, 30),
        "arrival_date": today + timedelta(days=2),
        "arrival_time": time(5, 45),
        "ticket_price": 850.00,
        "total_seats": 36,
        "amenities": "WiFi, Charging Point, Clean Blankets, Mineral Water, Reading Light, AC, Live GPS",
        "boarding_point": "CMBT Koyambedu, Ashok Pillar, Guindy, Tambaram, Perungalathur",
        "dropping_point": "Gandhipuram Omni Bus Stand, Hope College, KMCH, Singanallur",
        "description": "Premium Volvo multi-axle sleeper coach with sanitized berths, individual entertainment screens, emergency exits, and experienced highway drivers.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Kongu Express Scania AC Semi-Sleeper",
        "bus_number": "TN-38-BZ-4521",
        "bus_type": "AC Semi-Sleeper (2+2)",
        "source": "Coimbatore",
        "destination": "Chennai",
        "date": today + timedelta(days=1),
        "time": time(22, 00),
        "arrival_date": today + timedelta(days=2),
        "arrival_time": time(6, 15),
        "ticket_price": 680.00,
        "total_seats": 40,
        "amenities": "AC, Pushback Calf-Rest Seats, USB Charging, Water Bottle, Emergency Window",
        "boarding_point": "Gandhipuram Omni Bus Stand, Hopes, Sitra, Avinashi Bypass",
        "dropping_point": "Tambaram, Guindy, Koyambedu CMBT, Central Metro",
        "description": "Overnight highway express via Salem and Vellore with scheduled refreshment rest stops.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Pandian Superfast AC Sleeper Coach",
        "bus_number": "TN-59-CV-3312",
        "bus_type": "Luxury Sleeper (2+1)",
        "source": "Chennai",
        "destination": "Madurai",
        "date": today + timedelta(days=1),
        "time": time(21, 00),
        "arrival_date": today + timedelta(days=2),
        "arrival_time": time(5, 15),
        "ticket_price": 750.00,
        "total_seats": 32,
        "amenities": "WiFi, Blankets, Pillows, Mobile Charging, Water, Snacks",
        "boarding_point": "Kilambakkam KCBT, Tambaram, Chengalpattu Toll",
        "dropping_point": "Mattuthavani Integrated Bus Stand, Periyar Bus Stand, Thirumangalam",
        "description": "Comfortable overnight journey connecting Chennai to Temple City Madurai via Trichy NH45.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Vaigai Royal AC Multi-Axle Sleeper",
        "bus_number": "TN-58-AL-7740",
        "bus_type": "AC Sleeper (2+1)",
        "source": "Madurai",
        "destination": "Chennai",
        "date": today + timedelta(days=1),
        "time": time(21, 45),
        "arrival_date": today + timedelta(days=2),
        "arrival_time": time(6, 00),
        "ticket_price": 780.00,
        "total_seats": 36,
        "amenities": "WiFi, Charging Ports, Individual Blankets, Bottled Water, Reading Lamp",
        "boarding_point": "Mattuthavani Omni Bus Stand, Fatima College, Samayanallur Bypass",
        "dropping_point": "Perungalathur, Tambaram MEPZ, Guindy, Koyambedu",
        "description": "Premium smooth air-suspension sleeper traveling directly to Chennai via 4-lane expressway.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Chola Express AC Seater & Semi-Sleeper",
        "bus_number": "TN-45-AX-8812",
        "bus_type": "AC Semi-Sleeper (2+2)",
        "source": "Chennai",
        "destination": "Tiruchirappalli",
        "date": today + timedelta(days=1),
        "time": time(14, 00),
        "arrival_date": today + timedelta(days=1),
        "arrival_time": time(20, 00),
        "ticket_price": 480.00,
        "total_seats": 44,
        "amenities": "AC, Pushback Seats, USB Charging, Mineral Water, Entertainment Screen",
        "boarding_point": "CMBT Koyambedu, Porur Toll, Tambaram, Guduvanchery",
        "dropping_point": "Central Bus Stand Trichy, Chatiram Bus Stand, Samayapuram Toll",
        "description": "Daytime express connecting Chennai to Tiruchirappalli via Villupuram bypass.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Nilgiri Mountain Queen AC Luxury Coach",
        "bus_number": "TN-43-C-1022",
        "bus_type": "AC Semi-Sleeper (2+2)",
        "source": "Coimbatore",
        "destination": "Ooty",
        "date": today + timedelta(days=1),
        "time": time(7, 30),
        "arrival_date": today + timedelta(days=1),
        "arrival_time": time(11, 00),
        "ticket_price": 320.00,
        "total_seats": 32,
        "amenities": "Panoramic Windows, AC, Ergonomic Recliners, Music, First Aid Kit",
        "boarding_point": "Gandhipuram New Bus Stand, Mettupalayam Road, Thudiyalur",
        "dropping_point": "Coonoor Bus Stand, Charring Cross Ooty, ATC Main Bus Stand",
        "description": "Scenic hill country express climbing through Nilgiris hairpin bends with experienced mountain drivers.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Nellai Highway Star AC Sleeper",
        "bus_number": "TN-72-BK-6789",
        "bus_type": "Luxury Sleeper (2+1)",
        "source": "Salem",
        "destination": "Tirunelveli",
        "date": today + timedelta(days=2),
        "time": time(22, 15),
        "arrival_date": today + timedelta(days=3),
        "arrival_time": time(5, 30),
        "ticket_price": 620.00,
        "total_seats": 36,
        "amenities": "WiFi, Charging Point, Blankets, Reading Lights, Emergency Exit",
        "boarding_point": "Salem New Bus Stand, Kondalampatti Bypass, Seelanaickenpatti",
        "dropping_point": "Tirunelveli New Bus Stand, Vannarpettai, Palayamkottai",
        "description": "Direct southern corridor express via Karur, Dindigul, and Madurai ring road.",
        "status": Event.Status.PUBLISHED,
    },
    {
        "name": "Mango City Super Luxury Coach",
        "bus_number": "TN-30-EF-5544",
        "bus_type": "AC Semi-Sleeper (2+2)",
        "source": "Chennai",
        "destination": "Salem",
        "date": today + timedelta(days=2),
        "time": time(16, 00),
        "arrival_date": today + timedelta(days=2),
        "arrival_time": time(22, 15),
        "ticket_price": 520.00,
        "total_seats": 40,
        "amenities": "AC, Pushback Leather Seats, Fast Charging, Water Bottle",
        "boarding_point": "Kilambakkam KCBT, Tambaram, Kanchipuram Bypass",
        "dropping_point": "Salem New Bus Stand, AVR Roundana, Kuranguchavadi",
        "description": "Smooth evening transit connecting Chennai to Salem Steel & Mango city.",
        "status": Event.Status.PUBLISHED,
    }
]

for b_data in sample_buses:
    bus, created = Event.objects.update_or_create(
        name=b_data["name"],
        organizer=organizer,
        defaults=b_data,
    )
    print(f"{'Created' if created else 'Updated'}: {bus.name} ({bus.source} -> {bus.destination})")

print("Seeding completed successfully! All routes are strictly inside Tamil Nadu.")
