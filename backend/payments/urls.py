from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('update-status/<int:pk>/', PaymentViewSet.as_view({'patch': 'update_status'}), name='update-payment-status'),
    path('order/<int:order_id>/', PaymentViewSet.as_view({'get': 'order'}), name='payment-by-order'),
] 