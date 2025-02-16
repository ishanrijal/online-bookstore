from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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
    # permission_classes = [IsAuthenticated]  # Comment out for now
    permission_classes = [AllowAny]  # Allow all requests
    serializer_class = CartSerializer

    def get_queryset(self):
        # For development, return all carts
        return Cart.objects.all()
        # return Cart.objects.filter(user=self.request.user)  # Original line

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            book = Book.objects.get(id=book_id)
            if book.stock < quantity:
                return Response(
                    {'error': f'Only {book.stock} copies available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                book_id=book_id,
                defaults={'quantity': quantity}
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            return Response({
                'status': 'success',
                'message': 'Item added to cart',
                'cart_item': CartItemSerializer(cart_item).data
            })
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
    def update_quantity(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = cart.items.get(id=item_id)
            if quantity <= 0:
                cart_item.delete()
                return Response({'status': 'Item removed from cart'})
            
            if cart_item.book.stock < quantity:
                return Response(
                    {'error': f'Only {cart_item.book.stock} copies available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = quantity
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        try:
            cart.items.get(id=item_id).delete()
            return Response({'status': 'Item removed from cart'})
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

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
