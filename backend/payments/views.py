from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer

# Create your views here.

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(order__user=user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        payment = self.get_object()
        # Implement payment verification logic here
        # Example for eSewa/Khalti integration
        try:
            # Add your payment gateway verification logic here
            payment.status = 'Completed'
            payment.save()
            
            # Update order status
            order = payment.order
            order.status = 'Completed'
            order.save()
            
            return Response({
                'status': 'success',
                'message': 'Payment verified successfully'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel_payment(self, request, pk=None):
        payment = self.get_object()
        try:
            payment.status = 'Cancelled'
            payment.save()
            
            # Update order status
            order = payment.order
            order.status = 'Cancelled'
            order.save()
            
            return Response({
                'status': 'success',
                'message': 'Payment cancelled successfully'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def payment_history(self, request):
        payments = self.get_queryset()
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payment_details(self, request, pk=None):
        payment = self.get_object()
        serializer = self.get_serializer(payment)
        return Response({
            'payment': serializer.data,
            'order_details': {
                'order_id': payment.order.id,
                'total_amount': str(payment.order.total_price),
                'status': payment.order.status,
                'created_at': payment.order.created_at
            }
        })
