#!/usr/bin/env python3
"""
Populate DocSecure database with test documents
"""

import os
import sys
from pathlib import Path
import tempfile

# Add the current directory to path so we can import our database module
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from database import DocSecureDatabase

def create_test_file(content: str, filename: str) -> str:
    """Create a temporary test file with given content"""
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return file_path

def populate_database():
    """Populate database with test documents"""
    db = DocSecureDatabase()
    
    # Test documents to create
    test_docs = [
        {
            "title": "Procédure d'ouverture de compte client",
            "filename": "procedure_ouverture_compte.pdf",
            "category": "Procédures",
            "description": "Procédure complète pour l'ouverture d'un nouveau compte client avec toutes les vérifications nécessaires",
            "content": """PROCÉDURE D'OUVERTURE DE COMPTE CLIENT

1. VÉRIFICATION DE L'IDENTITÉ
- Contrôle des documents d'identité
- Vérification des informations personnelles
- Validation des coordonnées

2. ANALYSE DE SOLVABILITÉ
- Évaluation des revenus
- Vérification des antécédents bancaires
- Analyse de risque

3. FINALISATION
- Signature des documents
- Activation du compte
- Remise des moyens de paiement

Document créé le: 2025-09-01
Référence: PROC-001
"""
        },
        {
            "title": "Mode d'emploi système de trading électronique",
            "filename": "guide_trading_electronique.pdf",
            "category": "Modes d'emploi",
            "description": "Guide complet d'utilisation de la plateforme de trading électronique pour les clients institutionnels",
            "content": """GUIDE TRADING ÉLECTRONIQUE

1. CONNEXION À LA PLATEFORME
- Identifiants de connexion
- Authentification à deux facteurs
- Interface utilisateur

2. PASSATION D'ORDRES
- Types d'ordres disponibles
- Limite et marché
- Stop-loss et take-profit

3. SURVEILLANCE DES POSITIONS
- Suivi en temps réel
- Alertes et notifications
- Reporting

Document créé le: 2025-09-01
Référence: MODE-001
"""
        },
        {
            "title": "Note interne - Nouvelle réglementation MiFID II",
            "filename": "note_mifid2_update.pdf",
            "category": "Notes internes",
            "description": "Note d'information sur les dernières modifications réglementaires MiFID II et leur impact sur nos procédures",
            "content": """NOTE INTERNE - MIFID II UPDATE

OBJET: Mise à jour réglementaire MiFID II

1. NOUVEAUTÉS RÉGLEMENTAIRES
- Obligations de transparence renforcées
- Nouvelles règles de protection des investisseurs
- Reporting étendu

2. IMPACT SUR NOS PROCÉDURES
- Mise à jour des questionnaires client
- Renforcement des contrôles
- Formation du personnel

3. ÉCHÉANCES
- Mise en conformité: 31 décembre 2025
- Formation équipes: novembre 2025
- Tests procédures: décembre 2025

Document créé le: 2025-09-01
Référence: NOTE-001
Diffusion: Direction, Compliance, Front Office
"""
        },
        {
            "title": "Politique de sécurité informatique et protection des données",
            "filename": "politique_securite_donnees.pdf",
            "category": "Politiques",
            "description": "Politique de sécurité informatique et de protection des données personnelles conformément au RGPD",
            "content": """POLITIQUE DE SÉCURITÉ INFORMATIQUE

1. PRINCIPES GÉNÉRAUX
- Confidentialité des données
- Intégrité des systèmes
- Disponibilité des services
- Traçabilité des accès

2. PROTECTION DES DONNÉES PERSONNELLES
- Conformité RGPD
- Minimisation des données
- Durée de conservation
- Droits des personnes concernées

3. SÉCURITÉ DES SYSTÈMES
- Gestion des accès et identités
- Chiffrement des données sensibles
- Surveillance et détection d'incidents
- Plan de continuité d'activité

4. FORMATION ET SENSIBILISATION
- Formation annuelle obligatoire
- Tests de phishing
- Procédures d'incident

Version: 2.1
Date d'application: 2025-01-01
Prochaine révision: 2026-01-01
Référence: POL-SEC-001
"""
        }
    ]
    
    print("Populating DocSecure database with test documents...")
    
    for doc_info in test_docs:
        # Create temporary file
        temp_file = create_test_file(doc_info["content"], doc_info["filename"])
        
        try:
            # Upload document
            success, message, doc_id = db.upload_document(
                file_path=temp_file,
                title=doc_info["title"],
                category=doc_info["category"],
                description=doc_info["description"]
            )
            
            if success:
                print(f"[OK] Added: {doc_info['title']} (ID: {doc_id})")
            else:
                print(f"[ERROR] Failed: {doc_info['title']} - {message}")
                
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file)
            except:
                pass
    
    # Show statistics
    stats = db.get_statistics()
    print(f"\nDatabase statistics:")
    print(f"Total documents: {stats['total_documents']}")
    print(f"Total size: {stats['total_size_mb']} MB")
    print("Documents by category:")
    for category, count in stats['category_counts'].items():
        print(f"  - {category}: {count}")

if __name__ == "__main__":
    populate_database()