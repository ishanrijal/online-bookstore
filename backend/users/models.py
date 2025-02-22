from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Publisher', 'Publisher'),
        ('Author', 'Author'),
        ('Reader', 'Reader'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Reader')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_email_verified = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'  # Change this to use username as primary identifier
    REQUIRED_FIELDS = ['email']  # Make sure email is required

    def __str__(self):
        return self.username

class EmailVerificationToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
