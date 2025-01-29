from django.shortcuts import render
from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated, 
    AllowAny,
    IsAuthenticatedOrReadOnly
)
from django.db.models import Q
from .models import Book, Author, Publisher
from .serializers import BookSerializer, AuthorSerializer, PublisherSerializer
from users.permissions import IsAdminOrPublisher
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView

# Create your views here.

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'isbn', 'authors__user__username', 'category']
    ordering_fields = ['price', 'created_at', 'average_rating']

    # def get_permissions(self):
    #     # Allow all actions without authentication for development
    #     permission_classes = [AllowAny]
    #     return [permission() for permission in permission_classes]
    #     # @todo  Remove above line after development is done... 
    #     if self.action in ['create', 'update', 'partial_update', 'destroy']:
    #         permission_classes = [IsAuthenticated, IsAdminOrPublisher]
    #     else:
    #         permission_classes = [AllowAny]
    #     return [permission() for permission in permission_classes]


    def get_permissions(self):
        print(self.request.META.get('HTTP_AUTHORIZATION'))
        return [AllowAny()]

    @action(detail=True, methods=['post'])
    def add_to_wishlist(self, request, pk=None):
        book = self.get_object()
        request.user.favorite_books.add(book)
        return Response({'status': 'Book added to wishlist'})

    @action(detail=True, methods=['post'])
    def remove_from_wishlist(self, request, pk=None):
        book = self.get_object()
        request.user.favorite_books.remove(book)
        return Response({'status': 'Book removed from wishlist'})

    @action(detail=False)
    def recommendations(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        # Get user's favorite categories and authors
        user_orders = request.user.orders.all()
        favorite_categories = set()
        favorite_authors = set()
        
        for order in user_orders:
            for detail in order.order_details.all():
                favorite_categories.add(detail.book.category)
                favorite_authors.update(detail.book.authors.all())
        
        # Get recommended books
        recommended_books = Book.objects.filter(
            Q(category__in=favorite_categories) |
            Q(authors__in=favorite_authors)
        ).exclude(
            order_details__order__user=request.user
        ).distinct()[:10]
        
        serializer = self.get_serializer(recommended_books, many=True)
        return Response(serializer.data)

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
