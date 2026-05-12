# Attendance Tracker - Complete Setup Guide:
A Django-based attendance tracking system with REST API.
# Clone the Repository:
   - git clone https://github.com/RayesmiGJ/attendance_tracker.git
   - cd attendance_tracker
# Create Virtual Environment for Windows:
   - python -m venv .venv
   - .venv\Scripts\activate.bat
# Install Dependencies:
   - pip install -r requirements.txt
               (or)
   - pip install django
   - pip install djangorestframework 
   - pip install django-cors-headers 
# Run migrations:
   - python manage.py makemigrations
   - python manage.py migrate
   - python manage.py showmigrations 
# Create Admin User
   - python manage.py createsuperuser
     Follow prompts to enter:
      ->Username
      ->Email
      ->Password
# Start the server
   - python manage.py runserver
# Access the Application
   - Admin Panel: http://127.0.0.1:8000/admin
   *Login in it and create users*
# Install and Start the npm in an other terminal:
   npm install
   npm start


