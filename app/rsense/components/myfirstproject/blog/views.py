from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import base64

def home(request):
    return render(request, 'index.html')  # Assurez-vous que index.html est bien dans blog/templates/

@csrf_exempt
def upload_file(request):
    if request.method == "POST":
        try:
            report_name = request.POST.get("report_name")
            year = request.POST.get("year")
            month = request.POST.get("month")
            file = request.FILES.get("file")  # Utiliser request.FILES au lieu de base64

            if not file:
                return JsonResponse({"error": "No file provided"}, status=400)

            # Définir le chemin de stockage
            folder_path = os.path.join("media", "uploaded_reports", report_name, year, month)
            os.makedirs(folder_path, exist_ok=True)
            file_path = os.path.join(folder_path, file.name)

            # Sauvegarde du fichier
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            return JsonResponse({"message": "File uploaded successfully!", "file_path": file_path}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)
