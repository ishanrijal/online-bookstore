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

