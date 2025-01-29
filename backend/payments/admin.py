from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'type', 'status', 'date')
    list_filter = ('type', 'status', 'date')
    search_fields = ('order__user__username', 'transaction_id')
    ordering = ('-date',)
