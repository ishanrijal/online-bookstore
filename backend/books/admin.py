from django.contrib import admin
from .models import Book, Author, Publisher

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'isbn', 'price', 'stock', 'category', 'language')
    list_filter = ('category', 'language', 'publisher')
    search_fields = ('title', 'isbn', 'description')
    ordering = ('title',)

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('user', 'contact')
    search_fields = ('user__username', 'user__email')

@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'location')
    search_fields = ('name', 'location')
