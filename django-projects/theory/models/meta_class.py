'''
Meta is an inner class inside your Django model that holds configuration about the model itself — 
not about the data the model stores, but about how Django should treat that model.
'''

# It's literally just a plain inner class that Django reads and uses to configure the model's behavior.


# How Django Uses It Internally
'''

When Django processes your model class, it reads the Meta inner class and stores everything on a special object 
called _meta (an instance of Options). You can inspect it:

Article._meta.ordering        # ['-created_at']
Article._meta.db_table        # 'articles'
Article._meta.verbose_name    # 'article'
Article._meta.get_fields()    # all fields on the model

This _meta API is how Django itself — the ORM, the admin, migrations — knows everything about your model. 
Your Meta class is the input, _meta is the processed output.

'''


class Article(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']        # newest first
        # ordering = ['title']            # alphabetical
        # ordering = ['-views', 'title']  # most viewed, then alphabetical

# Without Meta ordering, you'd need this everywhere:
Article.objects.all().order_by('-created_at')

# With Meta ordering, this automatically returns newest first:
Article.objects.all()

# Any queryset that doesn't explicitly call .order_by() will use this. It's the default, not a lock — 
# you can always override it per query.


# db_table — The actual database table name

# By default Django names your table appname_modelname. 
# So an Article model in an app called blog gets the table blog_article. You can override this:

class Article(models.Model):
    title = models.CharField(max_length=200)

    class Meta:
        db_table = 'articles'           # exact table name in the database
        # db_table = 'cms_articles'     # useful when integrating with legacy DBs

# This is especially useful when you're connecting Django to an existing database that you didn't design 
# and the table names are already fixed.




