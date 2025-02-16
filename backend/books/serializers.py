from rest_framework import serializers
from .models import Book, Author, Publisher, Category

class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'user', 'bio', 'contact', 'profile_image']

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'book_count', 'created_at', 'updated_at']
        read_only_fields = ['slug', 'book_count']

    def get_book_count(self, obj):
        return obj.books.count()

class BookSerializer(serializers.ModelSerializer):
    publisher_details = PublisherSerializer(source='publisher', read_only=True)
    authors_details = AuthorSerializer(source='authors', many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'price', 'stock', 'description',
            'category', 'language', 'publisher', 'authors',
            'featured', 'publication_date', 'page_count',
            'dimensions', 'weight', 'edition', 'average_rating',
            'total_reviews', 'cover_image', 'created_at', 'updated_at',
            'category_name',
            'publisher_details',
            'authors_details',
            'favorited_by'
        ]
        read_only_fields = [
            'created_at', 
            'updated_at',
            'authors',
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