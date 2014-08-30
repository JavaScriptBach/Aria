from django.db import models

# Create your models here.

class Guide(models.Model):
	title = models.CharField(max_length=128)
	thumbs_up = models.PositiveIntegerField()
	thumbs_down = models.PositiveIntegerField()
	artist = models.CharField(max_length=128)
	summary = models.TextField()
	guide_data = models.TextField()
	score_data = models.TextField()
	score_url = models.URLField()
	pub_date = models.DateTimeField('date published')
	update_date = models.DateTimeField('last updated')