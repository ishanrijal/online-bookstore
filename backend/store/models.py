from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('Reader', 'Reader'),
        ('Author', 'Author'),
        ('Publisher', 'Publisher'),
        ('Admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Reader')
    address = models.TextField(null=True, blank=True)
    contact = models.CharField(max_length=15, null=True, blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='store_users',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='store_users',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.'
    )


class Publisher(models.Model):
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=15, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    website = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name


class Author(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='author_profile')
    bio = models.TextField(null=True, blank=True)
    contact = models.CharField(max_length=15, null=True, blank=True)
    profile_image = models.ImageField(upload_to='authors/', null=True, blank=True)

    def __str__(self):
        return self.user.username


class Book(models.Model):
    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Nepali', 'Nepali'),
    ]

    title = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)  # Set default for new field
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='English')  # Default value
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE, related_name='books')
    authors = models.ManyToManyField(Author, related_name='books')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # Default value
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')  # Default value
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"


class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='order_details')
    quantity = models.PositiveIntegerField(default=1)  # Default value
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # Default value
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order Detail #{self.id}"


class Payment(models.Model):
    PAYMENT_CHOICES = [
        ('eSewa', 'eSewa'),
        ('Khalti', 'Khalti'),
        ('Credit Card', 'Credit Card'),
        ('Cash', 'Cash'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # Default value
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='Cash')  # Default value

    def __str__(self):
        return f"Payment #{self.id}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=1)  # Default value
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review by {self.user.username} on {self.book.title}"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist item by {self.user.username}"


class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='recommended_to')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.user.username}"
