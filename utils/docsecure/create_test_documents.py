#!/usr/bin/env python3
"""
Create real test documents in the proper docsecureDOCS folder structure
"""

import os
import sys
from pathlib import Path
import json
from datetime import datetime

# Add the current directory to path so we can import our database module
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from database import DocSecureDatabase

def create_real_test_documents():
    """Create real PDF-like documents in the docsecureDOCS folders"""
    
    # Initialize database with correct root path
    db = DocSecureDatabase()
    
    print(f"Creating test documents in: {db.base_path}")
    print(f"Database location: {db.db_path}")
    
    # Test documents to create
    test_docs = [
        {
            "title": "Procédure d'ouverture de compte client",
            "filename": "procedure_ouverture_compte.pdf",
            "category": "Procédures",
            "description": "Procédure complète pour l'ouverture d'un nouveau compte client avec toutes les vérifications nécessaires",
            "content": """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 350
>>
stream
BT
/F1 12 Tf
50 750 Td
(PROCEDURE D'OUVERTURE DE COMPTE CLIENT) Tj
0 -40 Td
(Document de reference: PROC-001) Tj
0 -30 Td
(Date de creation: 2025-09-01) Tj
0 -40 Td
(1. VERIFICATION DE L'IDENTITE) Tj
0 -20 Td
(- Controle des documents d'identite) Tj
0 -20 Td
(- Verification des informations personnelles) Tj
0 -20 Td
(- Validation des coordonnees) Tj
0 -30 Td
(2. ANALYSE DE SOLVABILITE) Tj
0 -20 Td
(- Evaluation des revenus) Tj
0 -20 Td
(- Verification des antecedents bancaires) Tj
0 -20 Td
(- Analyse de risque) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000670 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
737
%%EOF"""
        },
        {
            "title": "Mode d'emploi système de trading électronique",
            "filename": "guide_trading_electronique.pdf",
            "category": "Modes d'emploi",
            "description": "Guide complet d'utilisation de la plateforme de trading électronique pour les clients institutionnels",
            "content": """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 300
>>
stream
BT
/F1 12 Tf
50 750 Td
(GUIDE TRADING ELECTRONIQUE) Tj
0 -40 Td
(Document de reference: MODE-001) Tj
0 -30 Td
(Date de creation: 2025-09-01) Tj
0 -40 Td
(1. CONNEXION A LA PLATEFORME) Tj
0 -20 Td
(- Identifiants de connexion) Tj
0 -20 Td
(- Authentification a deux facteurs) Tj
0 -20 Td
(- Interface utilisateur) Tj
0 -30 Td
(2. PASSATION D'ORDRES) Tj
0 -20 Td
(- Types d'ordres disponibles) Tj
0 -20 Td
(- Limite et marche) Tj
0 -20 Td
(- Stop-loss et take-profit) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000620 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
687
%%EOF"""
        },
        {
            "title": "Note interne - Nouvelle réglementation MiFID II",
            "filename": "note_mifid2_update.pdf",
            "category": "Notes internes",
            "description": "Note d'information sur les dernières modifications réglementaires MiFID II et leur impact sur nos procédures",
            "content": """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 380
>>
stream
BT
/F1 12 Tf
50 750 Td
(NOTE INTERNE - MIFID II UPDATE) Tj
0 -40 Td
(Document de reference: NOTE-001) Tj
0 -30 Td
(Date de creation: 2025-09-01) Tj
0 -40 Td
(OBJET: Mise a jour reglementaire MiFID II) Tj
0 -30 Td
(1. NOUVEAUTES REGLEMENTAIRES) Tj
0 -20 Td
(- Obligations de transparence renforcees) Tj
0 -20 Td
(- Nouvelles regles de protection des investisseurs) Tj
0 -20 Td
(- Reporting etendu) Tj
0 -30 Td
(2. IMPACT SUR NOS PROCEDURES) Tj
0 -20 Td
(- Mise a jour des questionnaires client) Tj
0 -20 Td
(- Renforcement des controles) Tj
0 -20 Td
(- Formation du personnel) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000700 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
767
%%EOF"""
        },
        {
            "title": "Politique de sécurité informatique et protection des données",
            "filename": "politique_securite_donnees.pdf",
            "category": "Politiques",
            "description": "Politique de sécurité informatique et de protection des données personnelles conformément au RGPD",
            "content": """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 400
>>
stream
BT
/F1 12 Tf
50 750 Td
(POLITIQUE DE SECURITE INFORMATIQUE) Tj
0 -40 Td
(Document de reference: POL-SEC-001) Tj
0 -30 Td
(Version: 2.1 - Date: 2025-09-01) Tj
0 -40 Td
(1. PRINCIPES GENERAUX) Tj
0 -20 Td
(- Confidentialite des donnees) Tj
0 -20 Td
(- Integrite des systemes) Tj
0 -20 Td
(- Disponibilite des services) Tj
0 -20 Td
(- Tracabilite des acces) Tj
0 -30 Td
(2. PROTECTION DES DONNEES PERSONNELLES) Tj
0 -20 Td
(- Conformite RGPD) Tj
0 -20 Td
(- Minimisation des donnees) Tj
0 -20 Td
(- Duree de conservation) Tj
0 -20 Td
(- Droits des personnes concernees) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000720 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
787
%%EOF"""
        }
    ]
    
    print("Creating real test documents...")
    
    for doc_info in test_docs:
        # Create the document file directly in the appropriate category folder
        category_folder = db.categories[doc_info["category"]]
        category_path = db.base_path / category_folder
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        clean_name = "".join(c for c in doc_info["filename"].replace('.pdf', '') if c.isalnum() or c in (' ', '-', '_')).rstrip()
        unique_filename = f"{timestamp}_{clean_name}.pdf"
        file_path = category_path / unique_filename
        
        # Write the PDF content to the file
        with open(file_path, 'w', encoding='latin-1') as f:
            f.write(doc_info["content"])
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Insert into database using raw SQL (bypassing the upload_document validation)
        import sqlite3
        import hashlib
        import json
        
        # Calculate file hash
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        file_hash = hash_sha256.hexdigest()
        
        # Insert into database
        conn = sqlite3.connect(db.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO documents 
            (title, original_filename, stored_filename, category, description, 
             file_size, file_hash, mime_type, file_path, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            doc_info["title"],
            doc_info["filename"],
            unique_filename,
            doc_info["category"],
            doc_info["description"],
            file_size,
            file_hash,
            "application/pdf",
            str(Path(category_folder) / unique_filename),
            json.dumps({})
        ))
        
        document_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"[OK] Created: {doc_info['title']} (ID: {document_id})")
        print(f"     File: {file_path}")
        print(f"     Size: {file_size} bytes")
    
    # Show final statistics
    stats = db.get_statistics()
    print(f"\nDatabase statistics:")
    print(f"Total documents: {stats['total_documents']}")
    print(f"Total size: {stats['total_size_mb']} MB")
    print("Documents by category:")
    for category, count in stats['category_counts'].items():
        print(f"  - {category}: {count}")
    
    # List actual files in each directory
    print(f"\nActual files in docsecureDOCS:")
    for category_name, folder_name in db.categories.items():
        category_path = db.base_path / folder_name
        files = list(category_path.glob("*.pdf"))
        print(f"  {category_name} ({folder_name}): {len(files)} files")
        for file in files:
            print(f"    - {file.name}")

if __name__ == "__main__":
    create_real_test_documents()