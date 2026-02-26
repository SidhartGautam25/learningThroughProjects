# A Django model is just a Python class, and like any Python class, you can add methods to it.
# These methods operate on a single instance of the model — one row in the database.

# So this is important ->
#                  Manager or queryset -> operates on the Table
#                  Model method -> operates on the row

# Now lets understand what does this means
from django.db import models


class Person(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    birth_date = models.DateField()

    def baby_boomer_status(self):
        "Returns the person's baby-boomer status."
        import datetime

        if self.birth_date < datetime.date(1945, 8, 1):
            return "Pre-boomer"
        elif self.birth_date < datetime.date(1965, 1, 1):
            return "Baby boomer"
        else:
            return "Post-boomer"

    @property
    def full_name(self):
        "Returns the person's full name."
        return f"{self.first_name} {self.last_name}"


person = Person.objects.get(id=1)
print(person.baby_boomer_status())  # "Baby boomer"
# It takes self (the instance), reads self.birth_date, and returns a computed string.
#  No database query happens here — birth_date is already loaded on the object.

person = Person.objects.get(id=1)
print(person.full_name)    # "John Doe"  — no () needed
print(person.first_name)   # "John"      — actual db field, same syntax

'''
Why Put Logic in the Model at All?
     -> This follows Django's philosophy called Fat Models, Thin Views.
     -> Business logic that belongs to a piece of data should live on the model itself, 
        not scattered across views or serializers.
'''

# Django's Built-in Methods 

'''

__str__()
    -> How the object represents itself as a string
    -> Used in the admin interface and when you print the object

    class Person(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    # Without __str__:  <Person object (1)>  — useless
    # With __str__:     "John Doe"           — meaningful everywhere  

    This shows up in the Django admin, in shell debugging, in logs — everywhere Django needs to display an 
    object as text. Always define it.


'''


'''
get_absolute_url()
    ->Need to read it 

'''

# Overriding predefined model methods



'''
save()
The super().save() call is critical — that's what actually writes to the database.
our logic runs before (or after) that.
'''

class Blog(models.Model):
    name = models.CharField(max_length=100)
    tagline = models.TextField()

    def save(self, **kwargs):
        do_something()
        super().save(**kwargs)  # Call the "real" save() method.
        do_something_else()


# Abstract base classes

# Abstract base classes are useful when you want to put some common information into a number of other models
# You write your base class and put abstract=True in the Meta class
# That model will then not be used to create any database table
# Instead, when it is used as a base class for other models, its fields will be added to those of the child class.

from django.db import models


class CommonInfo(models.Model):
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()

    class Meta:
        abstract = True


class Student(CommonInfo):
    home_group = models.CharField(max_length=5)

# Student now has name, age, and home_group fields — but there is no Student table in the database.
