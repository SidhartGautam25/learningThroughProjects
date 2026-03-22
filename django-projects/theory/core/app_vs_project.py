# a project is a container , an app is the content
# so an project is like a mall , and app is like a store inside the mall

# we ran startproject command once per website , while startapp run multiple
# times
# 
# primary goal of the project is to handle the configuration ( db settings or
# middlewares )
# 
# primary goal of the app is to handle logic (models, views , templates etc)
# 
# 
# apps and project communicates using a registration processs
# in project urls.py , we need to include the apps urls
# other than that , we need to add the app in project's settings.py inside
# installed_apps array 