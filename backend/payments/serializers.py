from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_total = serializers.DecimalField(
        source='order.total_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status', 'transaction_id']

    def validate(self, attrs):
        if attrs['amount'] != attrs['order'].total_price:
            raise serializers.ValidationError({
                "amount": "Payment amount must match order total"
            })
        return attrs 