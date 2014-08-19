from django.shortcuts import render, get_object_or_404
from guides.models import Guide
from django.http import HttpResponse
from django.views import generic

# Create your views here.
class DetailView(generic.DetailView):
    model = Guide
    template_name = 'guide.html'
# def guide(request, guide_id):
#     guide = get_object_or_404(Guide, pk=guide_id)
#     return render(request, 'guide.html', {'guide': guide})
def create(request):
    return render(request, 'create-guide.html')
def submit_guide(request):
    message = "Hello world"
    return HttpResponse(message)