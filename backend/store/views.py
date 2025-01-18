from django.http import HttpResponse
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

User = get_user_model()

def home(request):
    return HttpResponse("Welcome to Bookpasal!")

class SignupView(APIView):
    def post(self, request):
        data = request.data
        try:
            required_fields = ['username', 'email', 'password', 'role', 'address', 'contact']
            for field in required_fields:
                if field not in data or not data[field]:
                    return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)