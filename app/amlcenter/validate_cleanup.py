#!/usr/bin/env python3
"""
Validation script to test the risk assessment table cleanup
"""

import sys
import json
from process_excel import process_risk_table

def validate_cleanup():
    """Validate that the cleanup eliminates all redundancies"""
    print("🧪 Testing risk assessment table cleanup...", file=sys.stderr)
    
    # Create test data with intentional duplicates to verify cleanup
    test_range_data = [
        # Zone géographique category
        {'A': 'Zone géographique', 'isCategory': True, 'rating': 'Faible'},
        {'A': 'Pays d\'enregistrement du client', 'B': 'Maroc', 'category': 'Zone géographique', 'rating': 'Faible'},
        {'A': 'Pays de résidence du(es) Bénéficiaire(s) Effectif(s)', 'B': 'Maroc', 'category': 'Zone géographique', 'rating': 'Faible'},
        {'A': 'Pays d\'ouverture du compte', 'B': 'Maroc', 'category': 'Zone géographique', 'rating': 'Faible'},
        
        # Duplicate category (should be filtered out)
        {'A': 'Zone géographique', 'isCategory': True, 'rating': 'Faible'},
        
        # Caractéristiques du client category
        {'A': 'Caractéristiques du client', 'isCategory': True, 'rating': 'Faible'},
        {'A': 'Secteur d\'activité du client', 'B': 'Société de gestion des OPCVM', 'category': 'Caractéristiques du client', 'rating': 'Faible'},
        {'A': 'Chiffre d\'Affaires du client', 'B': '', 'category': 'Caractéristiques du client', 'rating': 'Faible'},
        
        # Duplicate factor (should be filtered out)
        {'A': 'Secteur d\'activité du client', 'B': 'Société de gestion des OPCVM', 'category': 'Caractéristiques du client', 'rating': 'Faible'},
        
        # Réputation du client category
        {'A': 'Réputation du client', 'isCategory': True, 'rating': 'Faible'},
        {'A': 'Nombre de Déclarations de Soupçon', 'B': '0', 'category': 'Réputation du client', 'rating': 'Faible'},
        {'A': 'Les Bénéficiaires Effectifs sont-ils des PPE ?', 'B': 'Non', 'category': 'Réputation du client', 'rating': 'Faible'},
        
        # Nature produits/opérations category
        {'A': 'Nature produits/opérations', 'isCategory': True, 'rating': 'Faible'},
        {'A': 'Garde et administration des titres', 'B': '', 'category': 'Nature produits/opérations', 'rating': 'Faible'},
        {'A': 'Opérations Sur Titres', 'B': '', 'category': 'Nature produits/opérations', 'rating': 'Faible'},
        
        # Canal de distribution category
        {'A': 'Canal de distribution', 'isCategory': True, 'rating': 'Faible'},
        {'A': 'Direct', 'B': '', 'category': 'Canal de distribution', 'rating': 'Faible'},
    ]
    
    print(f"📊 Input data contains {len(test_range_data)} items (including intentional duplicates)", file=sys.stderr)
    
    # Process the test data
    try:
        processed_data = process_risk_table(test_range_data)
        
        print(f"✅ Processing completed successfully", file=sys.stderr)
        print(f"📈 Output contains {len(processed_data)} categories", file=sys.stderr)
        
        # Validation checks
        validation_passed = True
        
        # Check 1: Verify expected number of categories (should be 5)
        expected_categories = 5
        if len(processed_data) != expected_categories:
            print(f"❌ Expected {expected_categories} categories, got {len(processed_data)}", file=sys.stderr)
            validation_passed = False
        else:
            print(f"✅ Correct number of categories: {len(processed_data)}", file=sys.stderr)
        
        # Check 2: Verify no duplicate categories
        category_names = [cat['name'] for cat in processed_data]
        unique_categories = set(category_names)
        if len(category_names) != len(unique_categories):
            duplicates = [name for name in category_names if category_names.count(name) > 1]
            print(f"❌ Duplicate categories found: {duplicates}", file=sys.stderr)
            validation_passed = False
        else:
            print(f"✅ No duplicate categories found", file=sys.stderr)
        
        # Check 3: Verify no duplicate factors within categories
        for category in processed_data:
            factor_names = [factor['name'] for factor in category.get('factors', [])]
            unique_factors = set(factor_names)
            if len(factor_names) != len(unique_factors):
                duplicates = [name for name in factor_names if factor_names.count(name) > 1]
                print(f"❌ Duplicate factors in '{category['name']}': {duplicates}", file=sys.stderr)
                validation_passed = False
            else:
                print(f"✅ No duplicate factors in '{category['name']}'", file=sys.stderr)
        
        # Check 4: Verify expected categories are present
        expected_category_names = [
            'Zone géographique',
            'Caractéristiques du client', 
            'Réputation du client',
            'Nature produits/opérations',
            'Canal de distribution'
        ]
        
        for expected_name in expected_category_names:
            if not any(cat['name'] == expected_name for cat in processed_data):
                print(f"❌ Missing expected category: {expected_name}", file=sys.stderr)
                validation_passed = False
            else:
                print(f"✅ Found expected category: {expected_name}", file=sys.stderr)
        
        # Check 5: Verify factors have proper structure
        for category in processed_data:
            for factor in category.get('factors', []):
                if not all(key in factor for key in ['name', 'profile', 'rating']):
                    print(f"❌ Factor missing required fields in '{category['name']}': {factor}", file=sys.stderr)
                    validation_passed = False
        
        if validation_passed:
            print("🎉 All validation checks passed! Risk assessment table cleanup is working correctly.", file=sys.stderr)
        else:
            print("⚠️  Some validation checks failed. Please review the issues above.", file=sys.stderr)
        
        # Output the processed data for inspection
        print("📋 Final processed data structure:", file=sys.stderr)
        for i, category in enumerate(processed_data):
            print(f"  {i+1}. {category['name']} ({category['rating']}) - {len(category.get('factors', []))} factors", file=sys.stderr)
            for j, factor in enumerate(category.get('factors', [])[:3]):  # Show first 3 factors
                print(f"     {j+1}. {factor['name']} -> {factor['profile'][:50]}... ({factor['rating']})", file=sys.stderr)
            if len(category.get('factors', [])) > 3:
                print(f"     ... and {len(category.get('factors', [])) - 3} more factors", file=sys.stderr)
        
        return validation_passed
        
    except Exception as e:
        print(f"❌ Error during processing: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False

if __name__ == "__main__":
    success = validate_cleanup()
    sys.exit(0 if success else 1)
