# Django’s serialization framework provides a mechanism for 
# “translating” Django models into other formats. 

# Usually these other formats will be text-based and used for sending Django 
# data over a wire, but it’s possible for a serializer to handle any format


# Your Django model lives in Python — it's a Python object with Python data 
# types. 
# But when you're building an API, you need to send data over the network as 
# JSON (or XML). 
# And when you receive data from a client, you need to convert that JSON back 
# into Python objects and validate it.

'''
-------------->   Serializing data   <-------------------

At the highest level, we can serialize data like this:


The arguments to the serialize function are the format to serialize the data to 
(see Serialization formats) and a QuerySet to serialize. (Actually, the second 
argument can be any iterator that yields Django model instances, but it’ll 
almost always be a QuerySet).

'''

from django.core import serializers

data = serializers.serialize("json", SomeModel.objects.all())


'''

If you only want a subset of fields to be serialized, you can specify a 
fields argument to the serializer:

In this example, only the name and size attributes of each model will be 
serialized. 
The primary key is always serialized as the pk element in the resulting output;
it never appears in the fields part.


'''
from django.core import serializers

data = serializers.serialize("json", SomeModel.objects.all(), fields=["name", "size"])



# more examples with explaination

from rest_framework import serializers

class ArticleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

article = Article.objects.get(pk=1)
serializer = ArticleSerializer(article)
serializer.data
# {'id': 1, 'title': 'Hello World', 'body': '...', 'created_at': '2024-01-01T...'}


# serializing a list ( many=Ture )
articles = Article.objects.all()
serializer = ArticleSerializer(articles, many=True)
serializer.data
# [{'id': 1, ...}, {'id': 2, ...}, ...]


'''
-----------------> Model Serializer <------------------

Writing every field manually is tedious. 
ModelSerializer reads your model and generates fields automatically:


'''

from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'body', 'created_at']
        # OR: fields = '__all__'  — include every field (use carefully)
        # OR: exclude = ['internal_notes']  — all fields except these

# this is equivalent of writing this ->

from rest_framework import serializers

class ArticleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)


# read_only_fields — Fields you can see but not write
class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'body', 'author', 'created_at']
        read_only_fields = ['id', 'created_at', 'author']
        # id and created_at come from the DB — clients can't set them
        # author is set from request.user — clients shouldn't send it




# SerializerMethodField — Computed Fields

# When a field's value doesn't come directly from the model but needs to be 
# computed, you use SerializerMethodField. 
# Django calls a method you define — get_<fieldname> — and whatever it returns 
# becomes the field value.

class ArticleSerializer(serializers.ModelSerializer):
    word_count = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'body', 'word_count', 'author_name', 'is_recent']

    def get_word_count(self, obj):
        # obj is the Article instance being serialized
        return len(obj.body.split())

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_is_recent(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        return obj.created_at >= timezone.now() - timedelta(days=7)
    

'''
Nested serializers
   -> When your model has relationships (ForeignKey, ManyToMany), 
      you can nest serializers to include related data:

Approach 1
'''

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'body', 'created_at']

class ArticleSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)          # ForeignKey — single object
    comments = CommentSerializer(many=True, read_only=True)  # reverse relation — list

    class Meta:
        model = Article
        fields = ['id', 'title', 'body', 'author', 'comments']

'''
lets understand this example
   -> read_only=True
           -> By default, serializers expect you to provide data for every 
              field when creating or updating an object. 

           -> What it does: It tells DRF that these fields should be included 
              when sending data to the user (GET requests), but should be 
              ignored when the user is sending data to the server 
              (POST/PUT requests).

           -> Why use it here: You usually don't want a user to "create" a new Author 
              or a list of Comments while they are just trying to post a new Article. 
              The author is typically handled by the backend (e.g., request.user), and 
              comments are created separately.

    -> many=True
            -> This is used specifically for relationships where there are 
            multiple items (QuerySets).

            -> What it does: It tells the serializer that it should expect a 
            list of objects rather than a single instance.

            -> In your code: Since an Article has many comments, many=True 
            ensures the CommentSerializer iterates through all related comments
            and returns them as a JSON array [...].


'''

'''
Approach 2  -> SerializerMethodField for nested (more control)

'''

class ArticleSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'comments']

    def get_comments(self, obj):
        # You control the queryset — filter, order, limit
        comments = Comment.objects.filter(
            post=obj
        ).order_by('-created_at')[:20]   # only latest 20
        return CommentSerializer(comments, many=True).data
    
'''
-> explaination to this code 

--->How it Works: The Mechanics

1.When DRF processes an Article instance, it sees the comments field is a 
SerializerMethodField. It then automatically looks for a method named 
get_<field_name> (in this case, get_comments).

2.The get_comments(self, obj) Method
        self: The instance of the serializer itself.
        obj: The specific Article instance being serialized right now.

3. The Logic:

       -> It manually queries the database for Comment objects.
       -> It filters them so they only belong to the current article (post=obj).
       -> It adds custom business logic: ordering by the newest first 
          (-created_at) and limiting the result to the latest 20.

       -> It manually calls CommentSerializer(comments, many=True).data to turn 
          that queryset into a list of JSON-ready dictionaries.


          

A important Note
        -> comments = Comment.objects.filter(post=obj)
              -> This implies that in your Comment model, the ForeignKey field 
                 is named post. If the field was named article, you would use 
                 article=obj.
'''