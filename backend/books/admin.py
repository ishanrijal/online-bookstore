from django.contrib import admin
from .models import Book, Author, Publisher, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'book_count', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('slug',)

    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = 'Number of Books'

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_authors', 'publisher', 'get_categories', 'price', 'stock')
    list_filter = ('categories', 'publisher', 'language')
    search_fields = ('title', 'isbn', 'description', 'authors__user__username')
    filter_horizontal = ('authors', 'favorited_by', 'categories')

    def get_authors(self, obj):
        return ", ".join([author.user.username for author in obj.authors.all()])
    get_authors.short_description = 'Authors'

    def get_categories(self, obj):
        return ", ".join([category.name for category in obj.categories.all()])
    get_categories.short_description = 'Categories'

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('user', 'contact')
    search_fields = ('user__username', 'user__email')

@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'location')
    search_fields = ('name', 'location')
