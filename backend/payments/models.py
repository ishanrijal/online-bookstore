from django.db import models
from users.models import User
from orders.models import Order

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('CASH', 'Cash on Delivery'),
        ('KHALTI', 'Khalti'),
        ('ESEWA', 'eSewa'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(
        max_length=10, 
        choices=PAYMENT_TYPES,
        default='CASH'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"Payment {self.id} - {self.order.id} - {self.amount}"
