#Primary Key in Django

# --> pk stands for Primary Key
# --> It is a unique identifier for every row in a database table.

'''

# You have 3 articles in your database:
# id=1  title="Hello World"
# id=2  title="Django Tutorial"
# id=3  title="Python Tips"

# pk lets you pinpoint exactly ONE record
article = Article.objects.get(pk=1)  # gives you "Hello World" and nothing else


'''

'''
------------>    Where does pk come from    <--------------

By default, Django automatically adds a primary key field to every model 
unless you define one yourself

'''

class Article(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()

# Django silently treats this as:
class Article(models.Model):
    id = models.AutoField(primary_key=True)  # added automatically
    title = models.CharField(max_length=200)
    body = models.TextField()


# AutoField is an integer that automatically increments — first record gets 1,
# second gets 2, and so on. 
# The database manages this, you never set it manually.


'''
-------------------> pk vs id  <---------------------

pk is an alias that always points to whatever field is the primary key on that 
model. 
When your primary key is the default id field, pk and id are identical. 
But if you define a custom primary key, pk still works while id might not exist:

'''

class Country(models.Model):
    code = models.CharField(max_length=2, primary_key=True)  # custom pk
    name = models.CharField(max_length=100)

country = Country.objects.get(pk='IN')   # works — pk points to code
country = Country.objects.get(code='IN') # works — same thing
country = Country.objects.get(id='IN')   # ERROR — id field doesn't exist

country.pk    # 'IN'
country.code  # 'IN'