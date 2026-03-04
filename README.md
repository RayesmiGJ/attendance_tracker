-----Commands used to run the project in Windows-----
#  Creating the Virtual Environment
   python -m venv .venv
   
# Activating the Virtual Environment
  .venv\Scripts\activate.bat

# Upgrade python
   python -m pip install --upgrade pip

# Install Django framework  
   python -m pip install Django

# Running development server 
   python manage.py runserver

-----Other django  commads used----
python manage.py makemigrations -> Creates migration files from model changes
python manage.py migrate -> Applies those changes to the database
python manage.py createsuperuser -> Creates an admin account for django admin 

-----Admin panel access-----
admin username -> ray
admin password -> sxcce123
admin URL: http://127.0.0.1:8000/admin
