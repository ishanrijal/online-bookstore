from django.contrib import admin
from .models import User, Publisher, Author, Book, Order, OrderDetail, Payment, Review, Wishlist, Recommendation

admin.site.register(User)
admin.site.register(Publisher)
admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Order)
admin.site.register(OrderDetail)
admin.site.register(Payment)
admin.site.register(Review)
admin.site.register(Wishlist)
admin.site.register(Recommendation)