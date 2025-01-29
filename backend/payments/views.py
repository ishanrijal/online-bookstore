from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
import requests
from django.conf import settings
from django.utils import timezone

# Create your views here.

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def verify_esewa(self, request, pk=None):
        payment = self.get_object()
        pid = request.data.get('pid')
        amount = request.data.get('amount')
        rid = request.data.get('rid')
        
        # Verify with eSewa API (example)
        verify_url = "https://uat.esewa.com.np/epay/transrec"
        payload = {
            'amt': amount,
            'rid': rid,
            'pid': pid,
            'scd': settings.ESEWA_MERCHANT_CODE
        }
        
        response = requests.post(verify_url, payload)
        if response.status_code == 200 and "Success" in response.text:
            payment.status = 'completed'
            payment.transaction_id = rid
            payment.verified_at = timezone.now()
            payment.save()
            return Response({'status': 'Payment verified'})
        return Response({'error': 'Payment verification failed'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def verify_khalti(self, request, pk=None):
        payment = self.get_object()
        token = request.data.get('token')
        amount = request.data.get('amount')

        # Verify with Khalti API (example)
        verify_url = "https://khalti.com/api/v2/payment/verify/"
        headers = {'Authorization': f'Key {settings.KHALTI_SECRET_KEY}'}
        payload = {'token': token, 'amount': amount}

        response = requests.post(verify_url, headers=headers, data=payload)
        if response.status_code == 200:
            payment.status = 'completed'
            payment.transaction_id = response.json().get('idx')
            payment.verified_at = timezone.now()
            payment.save()
            return Response({'status': 'Payment verified'})
        return Response({'error': 'Payment verification failed'}, 
                       status=status.HTTP_400_BAD_REQUEST)

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
