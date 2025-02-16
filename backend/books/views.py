from django.shortcuts import render
from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated, 
    AllowAny,
    IsAuthenticatedOrReadOnly,
    IsAdminUser
)
from django.db.models import Q
from .models import Book, Author, Publisher, Category
from .serializers import BookSerializer, AuthorSerializer, PublisherSerializer, CategorySerializer
from users.permissions import IsAdminOrPublisher
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
import json
from rest_framework import serializers

# Create your views here.

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'isbn', 'authors__user__username', 'category']
    ordering_fields = ['price', 'created_at', 'average_rating']
    permission_classes = [AllowAny]  # Temporarily allow all actions

    def get_permissions(self):
        # Debug print statements
        print("Request method:", self.request.method)
        print("Authorization header:", self.request.META.get('HTTP_AUTHORIZATION'))
        print("User:", self.request.user)
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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Handle file upload
        if 'cover_image' in request.FILES:
            # Delete old image if it exists
            if instance.cover_image:
                instance.cover_image.delete()
            
            instance.cover_image = request.FILES['cover_image']
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        # Same debug information for PATCH requests
        print("\n=== Debug Information (PATCH) ===")
        print("Request method:", request.method)
        print("Request data:", request.data)
        print("Content type:", request.content_type)
        
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        print("\n=== Delete Operation Debug Info ===")
        print("Request method:", request.method)
        print("Book ID:", kwargs.get('pk'))
        
        try:
            instance = self.get_object()
            book_title = instance.title  # Save title before deletion
            self.perform_destroy(instance)
            
            return Response({
                "status": "success",
                "message": f"Book '{book_title}' was successfully deleted"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("Delete Error:", str(e))
            return Response({
                "status": "error",
                "message": f"Failed to delete book: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_slug = request.query_params.get('category', '')
        try:
            category = Category.objects.get(slug=category_slug)
            books = self.queryset.filter(category=category)
            serializer = self.get_serializer(books, many=True)
            return Response(serializer.data)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'slug'

    def perform_destroy(self, instance):
        # Move books to uncategorized before deleting
        if instance.name.lower() != 'uncategorized':
            default_category = Category.get_default_category()
            instance.books.update(category_id=default_category)
            instance.delete()
        else:
            raise serializers.ValidationError("Cannot delete the Uncategorized category")
