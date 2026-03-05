-----Commands used to run the project-----
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
> python manage.py makemigrations -> Creates migration files from model changes
> python manage.py migrate -> Applies those changes to the database
> python manage.py createsuperuser -> Creates an admin account for django admin 

# Creating Admin account 
   python manage.py createsuperuser
   -> Enter the <username> , <mail id> and <password>
   
-----Admin panel access-----
admin username -> <username>
admin password -> <password>
admin URL: http://127.0.0.1:8000/admin
