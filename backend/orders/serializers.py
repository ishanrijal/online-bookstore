from rest_framework import serializers
from .models import Order, OrderDetail, Cart, CartItem, Invoice

class OrderDetailSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = OrderDetail
        fields = '__all__'
        read_only_fields = ['price']

class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'status', 'status_display',
            'shipping_address', 'contact_number', 'tracking_number',
            'created_at', 'updated_at', 'order_details'
        ]
        read_only_fields = ['user', 'total_price', 'tracking_number']

    def create(self, validated_data):
        user = self.context['request'].user
        order = Order.objects.create(user=user, **validated_data)
        return order 

class CartItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_price = serializers.DecimalField(source='book.price', read_only=True, max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = CartItem
        fields = ['id', 'book', 'book_title', 'book_price', 'quantity', 'subtotal', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['user']

class InvoiceSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(source='order.order_details', many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['invoice_number', 'total_amount', 'order_details'] 