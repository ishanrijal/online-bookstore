from django.shortcuts import render
from rest_framework import viewsets, status, generics, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.conf import settings
from .models import User, EmailVerificationToken
from .serializers import (UserSerializer, CustomTokenObtainPairSerializer, 
                         UserProfileUpdateSerializer, UserProfileSerializer, ChangePasswordSerializer)
from .permissions import IsAdminOrPublisher, IsOwnerOrReadOnly
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        identifier = attrs.get('username')
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError({
                'error': 'Both username/email and password are required.'
            })

        # Try to find user by either username or email
        try:
            user = User.objects.get(Q(username=identifier) | Q(email=identifier))
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'No account found with the given credentials'
            })

        # Try to authenticate
        authenticated_user = authenticate(
            request=self.context.get('request'),
            username=user.username,
            password=password
        )

        if not authenticated_user:
            raise serializers.ValidationError({
                'error': 'Invalid password'
            })

        attrs['username'] = user.username
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    # def get_permissions(self):
    #     if self.action in ['create']:
    #         permission_classes = []  # Allow anyone to register
    #     elif self.action in ['update', 'partial_update', 'destroy']:
    #         permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    #     elif self.action in ['list']:
    #         permission_classes = [IsAuthenticated, IsAdminOrPublisher]  # Only admin/publisher can list all users
    #     else:
    #         permission_classes = [IsAuthenticated]
    #     return [permission() for permission in permission_classes]

    
    def get_permissions(self):
        print(self.request.META.get('HTTP_AUTHORIZATION'))
        return [AllowAny()]

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        # Handle both multipart and JSON data
        if request.content_type == 'application/json':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
        else:
            # Handle multipart form data
            serializer = self.get_serializer(
                request.user,
                data=request.data,
                partial=True,
                context={'request': request}
            )
            
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
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

    @action(detail=True, methods=['post'])
    def admin_reset_password(self, request, pk=None):
        """Admin endpoint to reset user's password without requiring old password"""
        if not request.user.is_staff and not request.user.role == 'Admin':
            return Response(
                {'error': 'Only admin users can reset passwords'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response(
                {'error': 'New password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successfully'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return the response directly without verification
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
