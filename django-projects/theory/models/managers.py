# A Manager is the interface through which Django provides database query operations to your models.
# It's the thing that sits between your Python code and the database
# Every Django model has at least one manager, and by default it's called objects.
# When we write User.objects.all() or Post.objects.filter(active=True) — that objects is the manager.


'''
What does a manager actually do?
It provides methods to query the database:

.all() — get all records
.filter() — filter records based on conditions
.get() — get a single record
.create() — create a new record
.update() — update records
.delete() — delete records

'''

# Managers live at the model/database layer and are responsible for constructing querysets.
# Django separates "what data to fetch" logic from "how to use that data" logic. 



'''

Custom Managers




'''

class ArticleManager(models.Manager):
    def published(self):
        return self.filter(is_published=True)

    def by_author(self, author):
        return self.filter(author=author)

    def recent(self, days=7):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=days)
        return self.filter(created_at__gte=cutoff)

    def published_by_author(self, author):
        return self.published().by_author(author)  # compose them!

class Article(models.Model):
    title = models.CharField(max_length=200)
    is_published = models.BooleanField(default=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ArticleManager()

# Now your views look clean:
Article.objects.published()
Article.objects.recent(days=30)
Article.objects.published_by_author(request.user)