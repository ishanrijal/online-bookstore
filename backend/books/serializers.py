from rest_framework import serializers
from .models import Book, Author, Publisher

class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    publisher_details = PublisherSerializer(source='publisher', read_only=True)
    authors_details = AuthorSerializer(source='authors', many=True, read_only=True)

    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = [
            'created_at', 
            'updated_at',
            'authors',  # Make authors read-only for now
            'publisher_details',
            'authors_details',
            'average_rating',
            'total_reviews',
            'favorited_by'
        ]

    def update(self, instance, validated_data):
        # Remove all many-to-many and nested fields from validated_data
        validated_data.pop('publisher_details', None)
        validated_data.pop('authors_details', None)
        validated_data.pop('authors', None)
        validated_data.pop('favorited_by', None)
        
        # Update the instance with the remaining data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance 