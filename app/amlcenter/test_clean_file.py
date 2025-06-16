#!/usr/bin/env python3
"""
Test the clean Excel file processing
"""

from process_excel import process_excel_file
import json

def test_clean_file():
    try:
        result = process_excel_file('test_risk_assessment.xlsx')
        if result and 'clients' in result:
            client = result['clients'][0]
            print('Client name:', client.get('name'))
            print('Risk level:', client.get('riskLevel'))
            print('Categories:', len(client.get('processedRiskTable', [])))
            print()
            
            for i, category in enumerate(client.get('processedRiskTable', [])):
                factors_count = len(category.get('factors', []))
                print(f'{i+1}. {category["name"]} ({category["rating"]}) - {factors_count} factors')
                for factor in category.get('factors', []):
                    print(f'   - {factor["name"]} -> {factor["profile"]}')
                print()
        else:
            print('No result')
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_clean_file()
