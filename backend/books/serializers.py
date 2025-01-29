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