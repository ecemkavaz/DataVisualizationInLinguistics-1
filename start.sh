#!/bin/bash

# start your application
python manage.py runserver 0.0.0.0:8080
python manage.py makemigrations DataVisualization
python manage.py migrate