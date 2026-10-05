from django.urls import path

from .views import (
    RegisterView,
    CurrentUserView,
    CustomTokenObtainPairView,
    OperatorRequestsListView,
    OperatorRequestActionView,
    OperatorStatusCheckView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("operator-status/", OperatorStatusCheckView.as_view(), name="operator-status-check"),
    path("operator-requests/", OperatorRequestsListView.as_view(), name="operator-requests"),
    path(
        "operator-requests/<int:user_id>/action/",
        OperatorRequestActionView.as_view(),
        name="operator-request-action",
    ),
]