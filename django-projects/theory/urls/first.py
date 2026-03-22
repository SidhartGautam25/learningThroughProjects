'''
When a user requests a page from your Django-powered site, 
this is the algorithm the system follows to determine which
Python code to execute:

        1. Django determines the root URLconf module to use. 
        Ordinarily, this is the value of the ROOT_URLCONF setting, 
        but if the incoming HttpRequest object has a urlconf attribute 
        (set by middleware), its value will be used in place of the ROOT_URLCONF setting.


        2. Django loads that Python module and looks for the variable 
        urlpatterns. This should be a sequence of django.urls.path() and/or 
        django.urls.re_path() instances.

        
        3. Django runs through each URL pattern, in order, and stops at the 
        first one that matches the requested URL, matching against path_info.


        4. Once one of the URL patterns matches, Django imports and calls the 
        given view, which is a Python function (or a class-based view). 
        The view gets passed the following arguments ->
                    1. An instance of HttpRequest.

                    2. If the matched URL pattern contained no named groups, 
                    then the matches from the regular expression are provided 
                    as positional arguments.

                    3.The keyword arguments are made up of any named parts 
                    matched by the path expression that are provided, overridden
                    by any arguments specified in the optional kwargs argument 
                    to django.urls.path() or django.urls.re_path().

        5. If no URL pattern matches, or if an exception is raised during any 
        point in this process, Django invokes an appropriate error-handling 
        view.



Browser Request
      ↓
Django receives the URL
      ↓
URL Dispatcher checks urls.py patterns top to bottom
      ↓
First match wins → calls the associated view
      ↓
View returns a response back to the browser
        

'''

# Every Django project has a root urls.py. 
# This is the entry point for all URL routing:
# myproject/urls.py
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]

# urlpatterns is just a Python list. 
# Django goes through it top to bottom and stops at the first match.

# path() takes at minimum two arguments — the URL pattern string and 
# the view to call.



# -------------> URL Parameters — Capturing Dynamic Parts <--------------

# --------->   Capturing with <type:name> syntax
