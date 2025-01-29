from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'user', 
        'order', 
        'payment_type',
        'amount',
        'payment_date',
        'status'
    ]
    list_filter = [
        'payment_type',
        'status',
        'payment_date',
    ]
    search_fields = ['user__username', 'order__id', 'transaction_id']
    ordering = ['-payment_date']
