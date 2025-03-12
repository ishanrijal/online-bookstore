from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.urls import resolve
import re

class EmailVerificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Define protected paths that require email verification
        self.protected_paths = [
            r'^/api/dashboard/',
            r'^/api/books/my-books/',
            r'^/api/orders/',
            r'^/api/payments/',
        ]

    def __call__(self, request):
        # Skip middleware for non-API requests or authentication endpoints
        if not request.path.startswith('/api/') or request.path.startswith('/api/users/verify') or \
           request.path.startswith('/api/users/token/') or request.path == '/api/users/' or \
           request.method == 'OPTIONS':
            return self.get_response(request)

        # Check if the current path is protected
        path_is_protected = any(re.match(pattern, request.path) for pattern in self.protected_paths)
        
        if not path_is_protected:
            return self.get_response(request)

        # Authenticate the user
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(
                jwt_auth.get_raw_token(jwt_auth.get_header(request))
            )
            user = jwt_auth.get_user(validated_token)
            
            # Check if user's email is verified
            if not user.is_email_verified:
                return JsonResponse({
                    'error': 'Email not verified',
                    'message': 'Please verify your email before accessing this resource'
                }, status=403)
                
        except Exception:
            # If authentication fails, let the regular authentication process handle it
            pass
            
        return self.get_response(request) 