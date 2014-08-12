from django.shortcuts import render, get_object_or_404
from guides.models import Guide

# Create your views here.
def guide(request, guide_id):
    guide = get_object_or_404(Guide, pk=guide_id)
    return render(request, 'guide.html', {'guide': guide})