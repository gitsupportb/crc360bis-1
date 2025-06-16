import base64, os, json
from datetime import datetime
from google.colab import output

def upload_file(report_name, year, month, file_name, file_data, category="Unknown"):
    """
    Enregistre le fichier dans le dossier organisé :
      UPLOADED_REPORTINGS/<CATEGORY>/<REPORTING_NAME>/<YEAR>/<MONTH>/<file_name>
    """
    # Si le dataURL est présent, retirer le préfixe "data:..."
    if file_data.startswith("data:"):
        file_data = file_data.split(",")[1]
    file_bytes = base64.b64decode(file_data)

    # Nettoyer les noms pour les dossiers (supprimer caractères spéciaux)
    clean_category = clean_folder_name(category)
    clean_report_name = clean_folder_name(report_name)

    # Get the current working directory (dashboard prez app folder)
    base_dir = os.getcwd()

    # Structure: ./UPLOADED_REPORTINGS/CATEGORY/REPORTING_NAME/YEAR/MONTH/
    folder_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", clean_category, clean_report_name, str(year), str(month))
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, file_name)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Log the upload with full path information
    log_upload_to_file(report_name, file_name, category, file_path, year, month)

    return f"File uploaded successfully to {file_path}"

def clean_folder_name(name):
    """
    Nettoie le nom pour créer un nom de dossier valide
    """
    if not name or name == "Unknown":
        return "Unknown"

    # Remplacer les caractères spéciaux par des underscores
    import re
    # Garder seulement les lettres, chiffres, espaces, tirets et underscores
    cleaned = re.sub(r'[^\w\s\-]', '_', name)
    # Remplacer les espaces multiples par un seul underscore
    cleaned = re.sub(r'\s+', '_', cleaned)
    # Supprimer les underscores en début et fin
    cleaned = cleaned.strip('_')

    return cleaned if cleaned else "Unknown"

def log_upload_to_file(report_name, file_name, category, file_path, year, month):
    """
    Enregistre les détails de l'upload dans un fichier de log
    """
    log_entry = {
        "timestamp": str(datetime.now()),
        "report_name": report_name,
        "file_name": file_name,
        "category": category,
        "file_path": file_path,
        "year": year,
        "month": month
    }

    base_dir = os.getcwd()
    log_file_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", "upload_log.json")

    # Lire les logs existants ou créer une nouvelle liste
    if os.path.exists(log_file_path):
        with open(log_file_path, "r", encoding="utf-8") as f:
            try:
                logs = json.load(f)
            except:
                logs = []
    else:
        logs = []

    # Ajouter le nouveau log
    logs.append(log_entry)

    # Sauvegarder les logs
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
    with open(log_file_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2, ensure_ascii=False)

def get_uploaded_files_structure():
    """
    Retourne la structure des fichiers uploadés organisée par catégorie/rapport/date
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")
    if not os.path.exists(base_path):
        return {}

    structure = {}

    for category in os.listdir(base_path):
        category_path = os.path.join(base_path, category)
        if not os.path.isdir(category_path) or category == "upload_log.json":
            continue

        structure[category] = {}

        for report in os.listdir(category_path):
            report_path = os.path.join(category_path, report)
            if not os.path.isdir(report_path):
                continue

            structure[category][report] = {}

            for year in os.listdir(report_path):
                year_path = os.path.join(report_path, year)
                if not os.path.isdir(year_path):
                    continue

                structure[category][report][year] = {}

                for month in os.listdir(year_path):
                    month_path = os.path.join(year_path, month)
                    if not os.path.isdir(month_path):
                        continue

                    files = [f for f in os.listdir(month_path) if os.path.isfile(os.path.join(month_path, f))]
                    structure[category][report][year][month] = files

    return structure

def get_monthly_summary(year, month):
    """
    Retourne un résumé des fichiers uploadés pour un mois donné
    """
    structure = get_uploaded_files_structure()
    summary = {
        "total_files": 0,
        "categories": {},
        "reports": {}
    }

    for category, reports in structure.items():
        summary["categories"][category] = 0
        for report, years in reports.items():
            if str(year) in years and str(month) in years[str(year)]:
                file_count = len(years[str(year)][str(month)])
                summary["total_files"] += file_count
                summary["categories"][category] += file_count
                summary["reports"][report] = summary["reports"].get(report, 0) + file_count

    return summary

def get_category_summary():
    """
    Retourne un résumé par catégorie de tous les fichiers uploadés
    """
    structure = get_uploaded_files_structure()
    summary = {}

    for category, reports in structure.items():
        summary[category] = {
            "total_files": 0,
            "total_reports": len(reports),
            "reports": {}
        }

        for report, years in reports.items():
            report_files = 0
            for year, months in years.items():
                for month, files in months.items():
                    report_files += len(files)

            summary[category]["reports"][report] = report_files
            summary[category]["total_files"] += report_files

    return summary

# Enregistrement des fonctions afin qu'elles soient accessibles depuis JavaScript.
output.register_callback('upload_file', upload_file)
output.register_callback('get_monthly_summary', get_monthly_summary)
output.register_callback('get_uploaded_files_structure', get_uploaded_files_structure)
output.register_callback('get_category_summary', get_category_summary)

# Display the enhanced dashboard
from IPython.display import HTML
with open('reportingV2.txt', 'r', encoding='utf-8') as f:
    html_content = f.read()

HTML(html_content)
