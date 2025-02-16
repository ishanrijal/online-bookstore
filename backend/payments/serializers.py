from rest_framework import serializers
from .models import Payment
from orders.models import Order

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'user',
            'amount',
            'payment_type',
            'status',
            'transaction_id',
            'created_at'
        ]
        read_only_fields = ['user', 'amount', 'status', 'transaction_id']

    def validate(self, attrs):
        order = attrs.get('order')
        payment_type = attrs.get('payment_type')

        if not order:
            raise serializers.ValidationError({
                "order": "Order is required"
            })

        if not payment_type:
            raise serializers.ValidationError({
                "payment_type": "Payment type is required"
            })

        return attrs 