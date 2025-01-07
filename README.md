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
    - Create a MySQL database named "bookpasal"
    - Update database settings in settings.py if needed like changing username, password...
6. Run the migrations
    ```bash
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
