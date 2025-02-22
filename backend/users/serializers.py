from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'first_name', 
                 'last_name', 'phone', 'address', 'profile_picture', 'is_email_verified')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_email_verified': {'read_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'Reader'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            profile_picture=validated_data.get('profile_picture', None),
            is_email_verified=True
        )
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone', 'address', 'profile_picture')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'phone',
            'address',
            'profile_picture',
            'role'
        ]
        read_only_fields = ['role']
        extra_kwargs = {
            'profile_picture': {'required': False}
        }

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def update(self, instance, validated_data):
        # Handle profile picture update
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture
            
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value 