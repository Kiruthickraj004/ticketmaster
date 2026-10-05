from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="StrongPassword123!",
            role=User.Role.CUSTOMER,
        )

    def test_login_with_username(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "StrongPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "testuser")

    def test_login_with_email(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser@example.com", "password": "StrongPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["email"], "testuser@example.com")

    def test_get_current_user_me(self):
        # First login to get token
        login_resp = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "StrongPassword123!"},
            format="json",
        )
        token = login_resp.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["email"], "testuser@example.com")
        self.assertEqual(response.data["role"], "CUSTOMER")

    def test_get_current_user_unauthorized(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OperatorApprovalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="testadmin",
            email="admin@example.com",
            password="AdminPassword123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
            is_approved=True,
            approval_status=User.ApprovalStatus.APPROVED,
        )

    def test_operator_registration_requires_approval_and_blocks_login(self):
        # 1. Register new operator
        reg_response = self.client.post(
            "/api/auth/register/",
            {
                "username": "fastbus",
                "email": "fastbus@example.com",
                "password": "Password123!",
                "role": "OPERATOR",
                "organization_name": "FastBus Express",
                "contact_number": "+1 800 123 4567",
                "description": "Intercity bus services",
            },
            format="json",
        )
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reg_response.data["user"]["role"], "OPERATOR")
        self.assertFalse(reg_response.data["is_approved"])
        self.assertEqual(reg_response.data["approval_status"], "PENDING")

        # 2. Attempt login before admin approval -> should fail
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "fastbus", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)
        error_msg = str(login_response.data)
        self.assertIn("pending administrator approval", error_msg.lower())

        # 3. Admin lists operator requests
        self.client.force_authenticate(user=self.admin)
        req_list = self.client.get("/api/auth/operator-requests/?status=PENDING")
        self.assertEqual(req_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(req_list.data), 1)
        self.assertEqual(req_list.data[0]["username"], "fastbus")

        # 4. Admin approves the operator request
        operator_id = req_list.data[0]["id"]
        action_resp = self.client.post(
            f"/api/auth/operator-requests/{operator_id}/action/",
            {"action": "approve"},
            format="json",
        )
        self.assertEqual(action_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(action_resp.data["user"]["is_approved"])
        self.assertEqual(action_resp.data["user"]["approval_status"], "APPROVED")

        # 5. Now operator can log in successfully
        self.client.logout()
        approved_login = self.client.post(
            "/api/auth/login/",
            {"username": "fastbus", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(approved_login.status_code, status.HTTP_200_OK)
        self.assertIn("access", approved_login.data)
        self.assertEqual(approved_login.data["user"]["role"], "OPERATOR")

    def test_operator_rejection(self):
        # Register operator
        reg_response = self.client.post(
            "/api/auth/register/",
            {
                "username": "rejected_op",
                "email": "rejected@example.com",
                "password": "Password123!",
                "role": "OPERATOR",
                "organization_name": "Rejected Express",
                "contact_number": "+1 555 000 0000",
            },
            format="json",
        )
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        op_id = reg_response.data["user"]["id"]

        # Admin rejects
        self.client.force_authenticate(user=self.admin)
        reject_resp = self.client.post(
            f"/api/auth/operator-requests/{op_id}/action/",
            {"action": "reject"},
            format="json",
        )
        self.assertEqual(reject_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(reject_resp.data["user"]["is_approved"])
        self.assertEqual(reject_resp.data["user"]["approval_status"], "REJECTED")

        # Login attempt fails with rejection message
        self.client.logout()
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "rejected_op", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("declined", str(login_response.data).lower())

    def test_operator_status_check(self):
        # 0. Setup an operator user
        User.objects.create_user(
            username="approved_op",
            email="approved_op@example.com",
            password="Password123!",
            role=User.Role.OPERATOR,
            is_approved=True,
            approval_status=User.ApprovalStatus.APPROVED,
        )

        # 1. Check status of existing approved operator
        resp = self.client.post(
            "/api/auth/operator-status/",
            {"identifier": "approved_op"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["approval_status"], "APPROVED")
        self.assertTrue(resp.data["is_approved"])
        self.assertIn("approved", resp.data["message"].lower())

        # 2. Check status of non-existent operator
        resp_404 = self.client.post(
            "/api/auth/operator-status/",
            {"identifier": "unknown_operator"},
            format="json",
        )
        self.assertEqual(resp_404.status_code, status.HTTP_404_NOT_FOUND)



