from django.db import models
from orders.models import Order

class Payment(models.Model):
    PAYMENT_CHOICES = [
        ('eSewa', 'eSewa'),
        ('Khalti', 'Khalti'),
        ('Credit Card', 'Credit Card'),
        ('Cash', 'Cash'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='Cash')
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, default='Pending')

    def __str__(self):
        return f"Payment #{self.id} for Order #{self.order.id}"
