from rest_framework import serializers
from .models import Review, Wishlist

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, attrs):
        if attrs['rating'] < 1 or attrs['rating'] > 5:
            raise serializers.ValidationError({
                "rating": "Rating must be between 1 and 5"
            })
        return attrs

class WishlistSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_price = serializers.DecimalField(
        source='book.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = '__all__'
        read_only_fields = ['user'] 