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
from orders.models import Order
from rest_framework.exceptions import ValidationError

# Create your views here.

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'Admin':
            return Payment.objects.all()
        return Payment.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        try:
            # Get the order
            order_id = request.data.get('order')
            order = Order.objects.get(id=order_id)
            
            # Check if payment already exists
            existing_payment = Payment.objects.filter(order=order).first()
            if existing_payment:
                # Update existing payment
                existing_payment.status = request.data.get('status', 'PENDING')
                existing_payment.save()
                
                # Update order status if payment is marked as PAID
                if existing_payment.status == 'PAID' and order.status == 'Pending':
                    order.status = 'Processing'
                    order.save()
                
                serializer = self.get_serializer(existing_payment)
                return Response(serializer.data)
            
            # Create new payment
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payment = serializer.save()
            
            # Update order status if payment is marked as PAID
            if payment.status == 'PAID' and order.status == 'Pending':
                order.status = 'Processing'
                order.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Order.DoesNotExist:
            return Response({
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            payment = self.get_object()
            
            # Update payment status
            payment.status = request.data.get('status', payment.status)
            payment.save()
            
            # Update order status if payment is marked as PAID
            if payment.status == 'PAID' and payment.order.status == 'Pending':
                payment.order.status = 'Processing'
                payment.order.save()
            
            serializer = self.get_serializer(payment)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        payment = self.get_object()
        # Add your payment verification logic here
        payment.status = 'COMPLETED'
        payment.save()
        
        # Update order status
        payment.order.status = 'PAID'
        payment.order.save()
        
        return Response({'status': 'Payment verified'})

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        try:
            order = Order.objects.get(id=pk)
            payment = Payment.objects.filter(order=order).first()
            
            # Create payment if it doesn't exist
            if not payment:
                payment = Payment.objects.create(
                    order=order,
                    user=order.user,
                    amount=order.total_price,
                    payment_type='CASH'  # Default to cash payment
                )
            
            # Update payment status
            new_status = request.data.get('status')
            if new_status in ['PENDING', 'PAID', 'FAILED']:
                payment.status = new_status
                payment.save()
                
                # If payment is marked as PAID, update order status to Processing
                if new_status == 'PAID' and order.status == 'Pending':
                    order.status = 'Processing'
                    order.save()
                
                return Response({
                    'message': f'Payment status updated to {new_status}',
                    'status': payment.status,
                    'order_status': order.status
                })
            else:
                return Response({
                    'message': 'Invalid payment status'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Order.DoesNotExist:
            return Response({
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def order(self, request):
        order_id = request.query_params.get('order_id')
        try:
            payment = Payment.objects.get(order_id=order_id)
            serializer = self.get_serializer(payment)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response({
                'message': 'Payment not found for this order'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
