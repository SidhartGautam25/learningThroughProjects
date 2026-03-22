# A view function, or view for short, is a Python function that takes a 
# web request and returns a web respons

# The view returns an HttpResponse object that contains the generated response.
#  Each view function is responsible for returning an HttpResponse object. 
# (There are exceptions, but we’ll get to those later.)

# To display this view at a particular URL, you’ll need to create a URLconf;


'''
                ---------> View Decorators <----------

@require_http_methods(["GET", "POST"])
def my_view(request):
    # I can assume now that only GET or POST requests make it this far
    # ...
    pass


'''