from django.db import models
from users.models import User
from books.models import Book
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    shipping_address = models.TextField(null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    tracking_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

    def update_total_price(self):
        self.total_price = sum(detail.price for detail in self.order_details.all())
        self.save()

class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='order_details')
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def clean(self):
        if self.quantity > self.book.stock:
            raise ValidationError(f"Only {self.book.stock} copies available in stock.")

    def save(self, *args, **kwargs):
        self.clean()
        self.price = self.book.price * self.quantity
        super().save(*args, **kwargs)
        # Update book stock
        self.book.stock -= self.quantity
        self.book.save()
        # Update order total
        self.order.update_total_price()

    def delete(self, *args, **kwargs):
        # Restore book stock on deletion
        self.book.stock += self.quantity
        self.book.save()
        super().delete(*args, **kwargs)
        # Update order total
        self.order.update_total_price()

    def __str__(self):
        return f"Order #{self.order.id} - {self.quantity}x {self.book.title}"

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

    def get_items_count(self):
        return self.items.count()

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    @property
    def subtotal(self):
        return self.quantity * self.book.price

    def __str__(self):
        return f"{self.quantity}x {self.book.title} in {self.cart}"

    class Meta:
        unique_together = ('cart', 'book')

    def clean(self):
        if self.quantity > self.book.stock:
            raise ValidationError(f"Only {self.book.stock} copies available in stock.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    billing_address = models.TextField()
    shipping_address = models.TextField()
    payment_method = models.CharField(max_length=50)
    invoice_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number based on order ID and timestamp
            from django.utils import timezone
            timestamp = timezone.now().strftime('%Y%m%d')
            self.invoice_number = f"INV-{timestamp}-{self.order.id:04d}"
        
        # Calculate total amount including tax and shipping
        self.total_amount = (
            self.order.total_price + 
            self.tax_amount + 
            self.shipping_cost
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice #{self.invoice_number}"

class OrderHistory(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.order.id} - {self.action} by {self.user.username}"
