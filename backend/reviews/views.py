from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Review, Wishlist
from .serializers import ReviewSerializer, WishlistSerializer
from .permissions import IsOwnerOrReadOnly

# Create your views here.

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_permissions(self):
        # Allow unauthenticated access to list, retrieve, and book_reviews actions
        if self.action in ['list', 'retrieve', 'book_reviews', 'user_reviews']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_reviews(self, request, user_id=None):
        """
        Retrieve all reviews for a specific user
        """
        if not user_id:
            return Response(
                {"error": "user_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        reviews = Review.objects.filter(user_id=user_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_review(self, request, pk=None):
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {"error": "You can only edit your own reviews"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def book_reviews(self, request):
        book_id = request.query_params.get('book_id')
        if not book_id:
            return Response(
                {"error": "book_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        reviews = Review.objects.filter(book_id=book_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_wishlist(self, request):
        wishlist = self.get_queryset()
        serializer = self.get_serializer(wishlist, many=True)
        return Response(serializer.data)
