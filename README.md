# BookPasal - Online Bookstore

A full-stack web application built with Django and React for managing an online bookstore.

## Backend Setup

### Prerequisites
- Python 3.x
- pip (Python package manager)
- MySQL

### Installation Steps

1. Clone the repository and navigate to backend:
   ```bash
   git clone https://github.com/Aaryansss/bookpasal.git

   cd bookpasal/backend
    
    """
    cd bookpasal
    
    cd backend
    
    """
2. Create a virtual environment using command:
    ```bash
    python3 -m venv env
3. Activate the virtual env:
    ```bash
    For Linux/Mac: source env/bin/activate
    For Window: .\env\Scripts\activate
    GIT BASH: source env/Scripts/activate

4. Install the packages/ dependencies:
    ```bash
    pip install -r requirements.txt

5. Configure the database:
    - Create a MySQL database named "local"
    - Update database settings in settings.py if needed like changing username, password...

6. Create a new superuser:  
    ```bash
    python manage.py createsuperuser

7. Create a new migration in the database:
    ```bash
    python manage.py makemigrations users
    python manage.py makemigrations books
    python manage.py makemigrations orders
    python manage.py makemigrations payments
    python manage.py makemigrations reviews

8. Run the migrations
    ```bash
   python manage.py migrate auth
    python manage.py migrate contenttypes
    python manage.py migrate admin
    python manage.py migrate users
    python manage.py migrate
7. Run the development server
    - python manage.py runserver

<hr>

## Frontend Setup

1. Navigate to frontend directory:
2. Install dependencies:
    ```bash
    npm install
3. Start the development server:
    ```bash
    npm start


1. Cart end points
# List/Create Cart
GET/POST /api/orders/carts/

# Retrieve/Update/Delete Cart
GET/PUT/PATCH/DELETE /api/orders/carts/{cart_id}/

# Cart Actions
POST /api/orders/carts/{cart_id}/add_item/
POST /api/orders/carts/{cart_id}/remove_item/
POST /api/orders/carts/{cart_id}/update_quantity/
................................................................
2. Order end points
# List/Create Orders
GET/POST /api/orders/orders/

# Retrieve/Update/Delete Order
GET/PUT/PATCH/DELETE /api/orders/orders/{order_id}/

# Order Actions
POST /api/orders/orders/{order_id}/cancel/
GET /api/orders/orders/{order_id}/generate_invoice/



# This implementation provides:
1. JWT authentication with custom claims
2. Role-based access control
3. User registration with email verification
4. Profile update functionality
5. Secure password handling
6. Custom permissions for different user roles

# To use this:
1. Users can register using POST to /api/users/
2. Login using POST to /api/users/token/
3. Use the received token in Authorization header: Bearer <token>
4. Refresh tokens using POST to /api/users/token/refresh/
5. Update profile using PUT to /api/users/profile/
6. Verify email using POST to /api/users/verify-email/

# Remember to:
1. Replace the email settings with your actual email credentials
2. Add appropriate error handling
3. Consider adding password reset functionality
4. Add rate limiting for security
5. Consider adding more robust email templates


# Remember to:
1. Set up proper environment variables for sensitive data
2. Implement proper error handling
3. Add rate limiting for API endpoints
4. Add proper validation for all inputs
5. Implement caching for frequently accessed data
6. Add proper logging
7. Implement proper security measures


# Revert Migrations
```bash
python manage.py migrate --fake users zero
python manage.py migrate --fake books zero
python manage.py migrate --fake orders zero
python manage.py migrate --fake payments zero
python manage.py migrate --fake reviews zero
```
# Create fresh migration    
```bash
python manage.py makemigrations users
python manage.py makemigrations books
python manage.py makemigrations orders
python manage.py makemigrations payments
python manage.py makemigrations reviews
```
# Apply migration
```bash
python manage.py migrate
```






## API Endpoints
1. Books API
   List all books: GET /api/books/
    Get single book: GET /api/books/<id>/
    Create book: POST /api/books/
    Update book: PUT/PATCH /api/books/<id>/
    Delete book: DELETE /api/books/<id>/

2. Authors API
    List Authors
    URL: /api/authors/
    Method: GET
    Description: Retrieve a list of all authors.
    Create a New Author
    URL: /api/authors/
    Method: POST
    Description: Create a new author. Requires authentication.
    Retrieve a Specific Author
    URL: /api/authors/{id}/
    Method: GET
    Description: Retrieve details of a specific author by ID.
    Update a Specific Author
    URL: /api/authors/{id}/
    Method: PUT
    Description: Update an existing author by ID. Requires authentication.
    Delete a Specific Author
    URL: /api/authors/{id}/
    Method: DELETE
    Description: Delete a specific author by ID. Requires authentication.

3. Publishers API
    List Publishers
    URL: /api/publishers/
    Method: GET
    Description: Retrieve a list of all publishers.
    Create a New Publisher
    URL: /api/publishers/
    Method: POST
    Description: Create a new publisher. Requires authentication.
    Retrieve a Specific Publisher
    URL: /api/publishers/{id}/
    Method: GET
    Description: Retrieve details of a specific publisher by ID.
    Update a Specific Publisher
    URL: /api/publishers/{id}/
    Method: PUT
    Description: Update an existing publisher by ID. Requires authentication.
    Delete a Specific Publisher
    URL: /api/publishers/{id}/
    Method: DELETE
    Description: Delete a specific publisher by ID. Requires authentication.
    Summary of HTTP Methods
    GET: Used to retrieve data (list or specific item).
    POST: Used to create a new resource.
    PUT: Used to update an existing resource.
    DELETE: Used to remove a resource.
    Note

/api/books/categories/


    https://www.figma.com/proto/enG2TiSd7m5pALWWfI43wm/Project-Wireframes?node-id=0-1&t=GeVJsEHcccffXUBj-1