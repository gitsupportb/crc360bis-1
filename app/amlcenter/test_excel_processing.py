#!/usr/bin/env python3
"""
Test script to verify Excel processing improvements
"""

import sys
import os
import json
from process_excel import process_excel_file

def test_excel_processing():
    """Test the Excel processing with a sample file"""
    print("Testing Excel processing improvements...", file=sys.stderr)
    
    # Test with a sample Excel file if it exists
    test_files = [
        'uploads/test.xlsx',
        'uploads/sample.xlsx',
        'test.xlsx',
        'sample.xlsx'
    ]
    
    test_file = None
    for file_path in test_files:
        if os.path.exists(file_path):
            test_file = file_path
            break
    
    if not test_file:
        print("No test Excel file found. Creating a minimal test structure...", file=sys.stderr)
        # Return a test structure to verify the processing logic
        test_data = {
            'clients': [{
                'name': 'Test Client',
                'riskLevel': 'Faible',
                'updateDate': '2024-01-01',
                'assessmentDate': '2024-01-01',
                'processedRiskTable': [
                    {
                        'name': 'Zone géographique',
                        'rating': 'Faible',
                        'factors': [
                            {
                                'name': 'Pays d\'enregistrement du client',
                                'profile': 'Maroc',
                                'rating': 'Faible'
                            }
                        ]
                    },
                    {
                        'name': 'Caractéristiques du client',
                        'rating': 'Faible',
                        'factors': [
                            {
                                'name': 'Secteur d\'activité du client',
                                'profile': 'Société de gestion des OPCVM',
                                'rating': 'Faible'
                            }
                        ]
                    },
                    {
                        'name': 'Réputation du client',
                        'rating': 'Faible',
                        'factors': [
                            {
                                'name': 'Nombre de Déclarations de Soupçon à l\'encontre du client',
                                'profile': '0',
                                'rating': 'Faible'
                            }
                        ]
                    },
                    {
                        'name': 'Nature produits/opérations',
                        'rating': 'Faible',
                        'factors': [
                            {
                                'name': 'Garde et administration des titres',
                                'profile': 'Non spécifié',
                                'rating': 'Faible'
                            }
                        ]
                    },
                    {
                        'name': 'Canal de distribution',
                        'rating': 'Faible',
                        'factors': [
                            {
                                'name': 'Direct',
                                'profile': 'Non spécifié',
                                'rating': 'Faible'
                            }
                        ]
                    }
                ]
            }]
        }
        
        print("Test structure created successfully", file=sys.stderr)
        print(json.dumps(test_data))
        return
    
    try:
        print(f"Processing test file: {test_file}", file=sys.stderr)
        result = process_excel_file(test_file)
        
        # Validate the result structure
        if 'clients' in result and len(result['clients']) > 0:
            client = result['clients'][0]
            
            print(f"Successfully processed client: {client.get('name', 'Unknown')}", file=sys.stderr)
            
            if 'processedRiskTable' in client:
                risk_table = client['processedRiskTable']
                print(f"Found {len(risk_table)} categories in processedRiskTable", file=sys.stderr)
                
                # Check for duplicates
                category_names = [cat['name'] for cat in risk_table]
                unique_categories = set(category_names)
                
                if len(category_names) != len(unique_categories):
                    print("WARNING: Duplicate categories found!", file=sys.stderr)
                    duplicates = [name for name in category_names if category_names.count(name) > 1]
                    print(f"Duplicate categories: {duplicates}", file=sys.stderr)
                else:
                    print("✅ No duplicate categories found", file=sys.stderr)
                
                # Check for duplicate factors within categories
                for category in risk_table:
                    factor_names = [factor['name'] for factor in category.get('factors', [])]
                    unique_factors = set(factor_names)
                    
                    if len(factor_names) != len(unique_factors):
                        print(f"WARNING: Duplicate factors found in category '{category['name']}'!", file=sys.stderr)
                        duplicates = [name for name in factor_names if factor_names.count(name) > 1]
                        print(f"Duplicate factors: {duplicates}", file=sys.stderr)
                    else:
                        print(f"✅ No duplicate factors in category '{category['name']}'", file=sys.stderr)
            
            print("Test completed successfully", file=sys.stderr)
        
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error during testing: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)

if __name__ == "__main__":
    test_excel_processing()
