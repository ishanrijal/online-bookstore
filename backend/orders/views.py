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

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            book = Book.objects.get(id=book_id)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                book=book,
                defaults={'quantity': quantity}
            )
            
            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data)
        except Book.DoesNotExist:
            return Response(
                {'error': 'Book not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def update_quantity(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.quantity = quantity
            item.save()
            serializer = CartItemSerializer(item)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Create order from cart
        cart = get_object_or_404(Cart, user=self.request.user)
        order = serializer.save(user=self.request.user)

        # Create order details from cart items
        for cart_item in cart.items.all():
            OrderDetail.objects.create(
                order=order,
                book=cart_item.book,
                quantity=cart_item.quantity
            )

        # Clear the cart
        cart.items.all().delete()

        return order

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'Pending':
            order.status = 'Cancelled'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Order cannot be cancelled'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

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
