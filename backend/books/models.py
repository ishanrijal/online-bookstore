from django.db import models
from users.models import User
from django.utils.text import slugify

class Publisher(models.Model):
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=15, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    website = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name

class Author(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='author_profile')
    bio = models.TextField(null=True, blank=True)
    contact = models.CharField(max_length=15, null=True, blank=True)
    profile_image = models.ImageField(upload_to='authors/', null=True, blank=True)

    def __str__(self):
        return self.user.username

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @classmethod
    def get_default_category(cls):
        category, created = cls.objects.get_or_create(
            name='Uncategorized',
            defaults={
                'slug': 'uncategorized',
                'description': 'Default category for uncategorized books'
            }
        )
        return category.id

class Book(models.Model):
    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Nepali', 'Nepali'),
    ]

    # Core fields
    title = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_DEFAULT,
        default=1,
        related_name='books'
    )
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='English')
    
    # Relations
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE, related_name='books')
    authors = models.ManyToManyField(Author, related_name='books')
    
    # Additional metadata
    featured = models.BooleanField(default=False)
    publication_date = models.DateField(null=True, blank=True)
    page_count = models.PositiveIntegerField(null=True, blank=True)
    dimensions = models.CharField(max_length=50, null=True, blank=True)  # e.g., "5.5 x 8.5 inches"
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # in grams
    edition = models.CharField(max_length=50, null=True, blank=True)
    favorited_by = models.ManyToManyField(
        'users.User', 
        related_name='favorite_books',
        blank=True
    )
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)
    cover_image = models.ImageField(upload_to='books/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def update_rating_stats(self):
        from reviews.models import Review
        reviews = Review.objects.filter(book=self)
        if reviews.exists():
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.average_rating = round(avg, 2)
            self.total_reviews = reviews.count()
            self.save()

    def save(self, *args, **kwargs):
        if not self.category_id:
            self.category_id = Category.get_default_category()
        super().save(*args, **kwargs)
