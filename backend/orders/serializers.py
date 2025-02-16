from rest_framework import serializers
from .models import Order, OrderDetail, Cart, CartItem, Invoice

class OrderDetailSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_price = serializers.DecimalField(source='book.price', max_digits=10, decimal_places=2, read_only=True)
    book_cover = serializers.ImageField(source='book.cover_image', read_only=True)
    subtotal = serializers.SerializerMethodField()  # Calculate subtotal in serializer

    class Meta:
        model = OrderDetail
        fields = [
            'id',
            'order',
            'book',
            'book_title',
            'book_price',
            'book_cover',
            'quantity',
            'price',
            'subtotal'
        ]
        read_only_fields = ['price']

    def get_subtotal(self, obj):
        return obj.price * obj.quantity

class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 
            'user',
            'shipping_address', 
            'contact_number',
            'total_price', 
            'status',
            'status_display',
            'created_at',
            'order_details'
        ]
        read_only_fields = [
            'user',
            'total_price', 
            'status',
            'status_display',
            'order_details'
        ]

    def create(self, validated_data):
        validated_data['status'] = 'PENDING'
        return super().create(validated_data)

class CartItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_price = serializers.DecimalField(source='book.price', max_digits=10, decimal_places=2, read_only=True)
    book_cover = serializers.ImageField(source='book.cover_image', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'book', 'book_title', 'book_price', 'book_cover', 'quantity', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'items_count', 'created_at', 'updated_at']

class InvoiceSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(source='order.order_details', many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['invoice_number', 'total_amount', 'order_details'] 