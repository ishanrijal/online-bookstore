from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .models import User, EmailVerificationToken
from .serializers import (UserSerializer, CustomTokenObtainPairSerializer, 
                         UserProfileUpdateSerializer)
from .permissions import IsAdminOrPublisher, IsOwnerOrReadOnly

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = []  # Allow anyone to register
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        elif self.action in ['list']:
            permission_classes = [IsAuthenticated, IsAdminOrPublisher]  # Only admin/publisher can list all users
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        token = request.data.get('token')
        try:
            verification = EmailVerificationToken.objects.get(token=token)
            user = verification.user
            user.is_email_verified = True
            user.save()
            verification.delete()
            return Response({'message': 'Email verified successfully'})
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid token'}, 
                          status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        user = serializer.save()
        token = EmailVerificationToken.objects.create(user=user)
        
        # Send verification email
        verification_url = f"http://localhost:3000/verify-email?token={token.token}"
        send_mail(
            'Verify your email',
            f'Click this link to verify your email: {verification_url}',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        # Implement password reset logic here
        return Response({'detail': 'Password reset email sent.'})
