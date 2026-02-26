# A QuerySet is a collection of database queries that Django builds up lazily

# Every time you call a method on a queryset, it returns a new queryset — it never modifies the original.
# This makes them safe to pass around and build upon.

base_qs = Article.objects.filter(is_published=True)

# These are all separate querysets — base_qs is untouched
recent = base_qs.filter(created_at__gte=last_week)
by_author = base_qs.filter(author=request.user)
ordered = base_qs.order_by('-created_at')

# You can safely reuse base_qs
print(base_qs.count())  # still just published articles





         