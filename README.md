
# TicketMaster — Bus Ticket Booking Coding Task

A full-stack bus ticket booking application built as a technical interview assignment / learning project using **React** (Vite + Tailwind CSS) and **Django REST Framework** (PostgreSQL).

---

## 📋 The Task & Problem Statement

Standard ticket booking systems often require users to manually click individual seats on an interactive seating chart. This creates friction on mobile devices and leads to concurrency conflicts when multiple users attempt to pick the same seat simultaneously.

### Assignment Requirements:
1. **No Manual Seat Selection**: Users simply choose how many tickets they need (`1`, `2`, `3`...).
2. **Automatic Seat Allocation**: The backend automatically assigns the best available consecutive seats (`S1`, `S2`...) from remaining bus capacity.
3. **Ticket Modification (Add Tickets)**: Users must be able to update an existing confirmed booking to add more tickets and passengers without cancelling their reservation.
4. **Clean Light Theme**: A simple, intuitive light UI suited for bus transit.
5. **Role-Based Access**:
   - **Passengers**: Search routes, book tickets, add tickets to bookings, and cancel reservations.
   - **Bus Operators**: Schedule new bus trips and view the passenger manifest.

---

## 💡 Implementation Details

### 1. Auto Seat Allocation
- In `backend/events/views.py`, when a booking is submitted with `ticket_count = N`:
- The system checks `event.get_available_seats()`. If `available < N`, it returns a validation error.
- Otherwise, it automatically allocates the first `N` available seats (e.g. `['S1', 'S2']`) and saves them to the booking.

### 2. Adding More Tickets (`POST /api/bookings/<id>/add-tickets/`)
- Passengers can click **"Add More Tickets"** on their confirmed booking in `My Bookings`.
- A modal allows adding `+1`, `+2`... additional tickets with new passenger names.
- The backend wraps this in `@transaction.atomic`, allocates the next sequential seats, appends them to the booking, and recalculates the total fare.

### 3. Partial & Full Ticket Cancellation (`POST /api/bookings/<id>/cancel/`)
- Passengers can choose to cancel their entire reservation or cancel only a specific subset of tickets (e.g. cancel 2 out of 10 tickets).
- The system supports cancelling by count or by selecting specific allocated seat numbers.
- Released seats immediately return to the bus's available inventory for other passengers.
- Fare and remaining ticket count are automatically recalculated, and the remaining tickets stay confirmed and active.

### 4. Concurrency & Data Integrity
- Database operations for booking, adding tickets, and cancelling tickets use Django database transactions to prevent race conditions during seat assignment.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS (Light Theme), Axios, React Router v6
- **Backend**: Python 3.12, Django 6, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL (or SQLite)

---

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd backend

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Seed sample bus routes
python seed_buses.py

# Start backend server
python manage.py runserver 8000
```

Backend will run at: `http://localhost:8000/`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173/` (or port shown in terminal).

---

## 🔑 Test Credentials

| Role | Username | Password | Actions Available |
| :--- | :--- | :--- | :--- |
| **Passenger** | `john` | `Password123!` | Book tickets, add more tickets, view bookings, cancel |
| **Bus Operator** | `sarah` | `Password123!` | Schedule new buses, view passenger manifest |

---

## 🔌 Main API Endpoints

- `POST /api/auth/login/` — Authenticate and receive JWT tokens
- `GET /api/buses/` — List all scheduled buses (supports `?source=...&destination=...&date=...`)
- `GET /api/buses/<id>/` — Get bus trip details & available seats
- `GET /api/buses/<id>/seats/` — Live seat layout & allocation map
- `GET /api/bookings/` — Get authenticated passenger's bookings
- `POST /api/bookings/` — Book tickets (`bus`, `ticket_count`, `passenger_names`)
- `POST /api/bookings/<id>/add-tickets/` — Add more tickets (`additional_tickets`, `passenger_names`)
- `POST /api/bookings/<id>/cancel/` — Cancel booking and release seats
- `GET /api/operator/bookings/` — Bus operator view of passenger manifest
- `POST /api/auth/operator-status/` — Real-time self-service status check for operator applicants (`identifier`)

---

## 🛡️ Bus Operator Approval Workflow (Django Admin)

1. **Registration**: When a bus operator registers, their account is flagged as `PENDING` review (`is_approved=False`, login disabled).
2. **Review in Django Admin**: The platform administrator navigates to **Bus Operator Profiles** (`/admin/users/organizerprofile/`).
3. **Approve / Reject Action**: The admin reviews agency credentials and selects **"Approve selected Bus Operators"** or **"Reject selected Bus Operators"** from the batch Actions dropdown.
4. **Applicant Self-Service Notification**: Operators can check their application status at any time via the **"Check Application Status"** feature on the login page by providing their username or email, receiving real-time status updates and 1-click access once approved.

