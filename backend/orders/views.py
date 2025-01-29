from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderDetail, Invoice
from .serializers import (
    CartSerializer, CartItemSerializer, 
    OrderSerializer, OrderDetailSerializer,
    InvoiceSerializer
)
from books.models import Book
from django.http import FileResponse
from .utils import generate_invoice_pdf
from users.permissions import IsVerifiedUser

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                book_id=book_id,
                defaults={'quantity': quantity}
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            return Response({'status': 'Item added to cart'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        cart.items.filter(id=item_id).delete()
        return Response({'status': 'Item removed from cart'})

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsVerifiedUser]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        cart = self.request.user.cart
        
        # Convert cart items to order details
        for item in cart.items.all():
            order.order_details.create(
                book=item.book,
                quantity=item.quantity,
                price=item.book.price * item.quantity
            )
        
        # Clear the cart
        cart.items.all().delete()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'Pending':
            order.status = 'Cancelled'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response({'error': 'Cannot cancel this order'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return Invoice.objects.filter(order__user=self.request.user)

    @action(detail=True, methods=['get'])
    def generate_invoice(self, request, pk=None):
        order = self.get_object()
        invoice, created = Invoice.objects.get_or_create(
            order=order,
            defaults={
                'billing_address': order.shipping_address,
                'shipping_address': order.shipping_address,
                'payment_method': 'Default',
                'due_date': order.created_at,
            }
        )

        # Generate PDF if it doesn't exist or force regeneration is requested
        if not invoice.pdf_file or request.query_params.get('regenerate') == 'true':
            buffer = generate_invoice_pdf(invoice)
            
            if request.query_params.get('download') == 'true':
                return FileResponse(
                    buffer,
                    as_attachment=True,
                    filename=f'invoice_{invoice.invoice_number}.pdf'
                )

        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
