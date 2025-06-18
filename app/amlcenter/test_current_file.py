#!/usr/bin/env python3
"""
Test the current Excel file processing
"""

import sys
from process_excel import process_excel_file

def test_current_file():
    try:
        result = process_excel_file('uploads/excelFile-1749849010039.xlsx')
        print('=== PROCESSING RESULT ===')
        if result and 'clients' in result:
            print(f'Found {len(result["clients"])} clients')

            # Check the RED MED ASSET MANAGEMENT client specifically
            for client in result['clients']:
                if 'RED MED' in client.get('name', ''):
                    print(f'\n=== {client["name"]} ===')
                    print(f'Risk level: {client.get("riskLevel")}')
                    if 'processedRiskTable' in client:
                        print(f'Categories: {len(client["processedRiskTable"])}')
                        for i, category in enumerate(client['processedRiskTable']):
                            factors_count = len(category.get('factors', []))
                            print(f'{i+1}. {category["name"]} ({category["rating"]}) - {factors_count} factors')
                            for factor in category.get('factors', []):
                                print(f'   - {factor["name"]} -> {factor["profile"]}')
                    break
        else:
            print('No clients found in result')
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_current_file()
