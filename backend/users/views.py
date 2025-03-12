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
from datetime import timedelta
from django.utils import timezone
import logging

User = get_user_model()

logger = logging.getLogger(__name__)

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

        # Remove email verification check here - let them log in
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
        try:
            # Save the user first
            user = serializer.save()
            logger.info(f'User created successfully: {user.email}')
            return user
        except Exception as e:
            logger.error(f'Error in user registration: {str(e)}')
            raise

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = EmailVerificationToken.objects.create(user=user)
            reset_url = f"http://localhost:3000/reset-password?token={token.token}"
            send_mail(
                'Reset your password',
                f'Click this link to reset your password: {reset_url}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'Password reset email sent.'})
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email'}, status=status.HTTP_400_BAD_REQUEST)

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
        user = self.perform_create(serializer)
        
        # Generate verification code and send email
        try:
            # Delete any existing tokens
            EmailVerificationToken.objects.filter(user=user).delete()
            
            # Create new verification token
            token = EmailVerificationToken.objects.create(user=user)
            verification_code = token.token.hex[:6]
            
            # Create verification URL and email content
            verification_url = f"http://localhost:3000/verify-email?token={token.token}"
            email_subject = 'Verify your email to access BookPasal'
            email_body = f'''
            Welcome to BookPasal!
            
            Your verification code is: {verification_code}
            
            Or click this link to verify your email: {verification_url}
            
            This code will expire in 30 seconds.
            '''
            
            # Send verification email
            send_mail(
                email_subject,
                email_body,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            logger.info(f'Verification email sent successfully to {user.email}')
            
        except Exception as e:
            logger.error(f'Failed to send verification email to {user.email}: {str(e)}')
            # Continue even if email fails
        
        # Return the response with user data
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def verify_code(self, request):
        code = request.data.get('code', '').strip()
        if not code:
            return Response({'error': 'Verification code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            logger.info(f'Attempting to verify code: {code}')
            
            # Get the most recent token that matches the code (first 6 characters)
            verification = EmailVerificationToken.objects.filter(
                token__startswith=code
            ).latest('created_at')
            
            logger.info(f'Found verification token for user: {verification.user.email}')

            if verification.is_expired():
                verification.delete()
                logger.warning(f'Verification code expired for user: {verification.user.email}')
                return Response({
                    'error': 'Verification code has expired',
                    'is_email_verified': False
                }, status=status.HTTP_400_BAD_REQUEST)

            # Verify the user
            user = verification.user
            user.is_email_verified = True
            user.save()
            
            logger.info(f'Successfully verified email for user: {user.email}')

            # Delete the verification token
            verification.delete()

            # Return success with user data
            serializer = UserSerializer(user)
            return Response({
                'message': 'Email verified successfully',
                'is_email_verified': True,
                'user': serializer.data
            }, status=status.HTTP_200_OK)

        except EmailVerificationToken.DoesNotExist:
            logger.warning(f'Invalid verification code attempt: {code}')
            return Response({
                'error': 'Invalid verification code',
                'is_email_verified': False
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'Error during email verification: {str(e)}')
            return Response({
                'error': 'An error occurred during verification',
                'is_email_verified': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def regenerate_code(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Delete all existing tokens for the user
            EmailVerificationToken.objects.filter(user=user).delete()
            # Create a new token
            new_token = EmailVerificationToken.objects.create(user=user)
            verification_code = new_token.token.hex[:6]
            verification_url = f"http://localhost:3000/verify-email?token={new_token.token}"
            send_mail(
                'New Verification Code',
                f'Click this link to verify your email: {verification_url}\nOr enter this code: {verification_code}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'New verification code sent.'})
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email'}, status=status.HTTP_400_BAD_REQUEST)
