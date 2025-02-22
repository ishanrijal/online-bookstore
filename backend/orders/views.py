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
    permission_classes = [IsAuthenticated]  # Re-enable authentication
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Get or create cart for the user
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Get book_id and quantity from request
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            book = Book.objects.get(id=book_id)
            
            # Check stock
            if book.stock < quantity:
                return Response(
                    {'error': f'Only {book.stock} copies available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create cart item
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                book=book,
                defaults={'quantity': quantity}
            )

            # If item already existed, update quantity
            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            serializer = self.get_serializer(cart)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

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

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add or update item in cart"""
        try:
            cart = Cart.objects.get(user=request.user)
            book_id = request.data.get('book_id')
            quantity = int(request.data.get('quantity', 1))
            update_type = request.data.get('update_type', 'set')  # 'set', 'increment', or 'decrement'

            try:
                book = Book.objects.get(id=book_id)
                cart_item = CartItem.objects.filter(cart=cart, book=book).first()

                if cart_item:
                    if update_type == 'increment':
                        new_quantity = cart_item.quantity + quantity
                    elif update_type == 'decrement':
                        new_quantity = max(1, cart_item.quantity - quantity)
                    else:
                        new_quantity = quantity

                    if new_quantity <= 0:
                        cart_item.delete()
                    else:
                        if book.stock < new_quantity:
                            return Response(
                                {'error': f'Only {book.stock} copies available'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        cart_item.quantity = new_quantity
                        cart_item.save()
                else:
                    if quantity > 0:
                        if book.stock < quantity:
                            return Response(
                                {'error': f'Only {book.stock} copies available'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        CartItem.objects.create(cart=cart, book=book, quantity=quantity)

                serializer = self.get_serializer(cart)
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

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove item from cart"""
        try:
            cart = Cart.objects.get(user=request.user)
            book_id = request.data.get('book_id')
            
            cart_item = CartItem.objects.filter(cart=cart, book_id=book_id).first()
            if cart_item:
                cart_item.delete()
            
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['patch'])
    def update_quantity(self, request):
        """Update cart item quantity"""
        try:
            cart = Cart.objects.get(user=request.user)
            book_id = request.data.get('book_id')
            quantity = int(request.data.get('quantity', 1))

            try:
                cart_item = CartItem.objects.get(cart=cart, book_id=book_id)
                
                if quantity <= 0:
                    cart_item.delete()
                else:
                    if cart_item.book.stock < quantity:
                        return Response(
                            {'error': f'Only {cart_item.book.stock} copies available'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    cart_item.quantity = quantity
                    cart_item.save()

                serializer = self.get_serializer(cart)
                return Response(serializer.data)

            except CartItem.DoesNotExist:
                return Response(
                    {'error': 'Cart item not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Get the user's current cart
        cart = Cart.objects.get(user=self.request.user)
        
        # Create order
        order = serializer.save(
            user=self.request.user,
            total_price=cart.total_price
        )

        # Create order details from cart items
        for cart_item in cart.items.all():
            # Calculate subtotal here instead of passing it
            OrderDetail.objects.create(
                order=order,
                book=cart_item.book,
                quantity=cart_item.quantity,
                price=cart_item.book.price  # Store individual book price
            )

        # Clear the cart
        cart.items.all().delete()

        return order

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'PENDING':
            order.status = 'CANCELLED'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Order cannot be cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Process checkout and create order"""
        try:
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create order
            order = Order.objects.create(
                user=request.user,
                shipping_address=request.data.get('shipping_address'),
                contact_number=request.data.get('contact_number'),
                status='Pending',
                total_price=cart.total_price
            )

            # Create order details from cart items
            for cart_item in cart.items.all():
                OrderDetail.objects.create(
                    order=order,
                    book=cart_item.book,
                    quantity=cart_item.quantity,
                    price=cart_item.book.price
                )

            # Clear cart after order creation
            cart.items.all().delete()

            return Response({
                'status': 'success',
                'order_id': order.id,
                'total_amount': float(order.total_price)
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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
