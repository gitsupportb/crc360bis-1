#!/usr/bin/env python3
"""
Test the complete processing pipeline
"""

from process_excel import extract_risk_table_structured, process_risk_table
import openpyxl

def test_complete():
    try:
        # Load workbook
        wb = openpyxl.load_workbook('uploads/excelFile-1749849010039.xlsx')
        
        # Extract data
        raw_data = extract_risk_table_structured(wb, 'RED MED ASSET MANAGEMENT')
        print(f'Raw data extracted: {len(raw_data)} items')
        
        # Process data
        processed_data = process_risk_table(raw_data)
        print(f'Processed data: {len(processed_data)} categories')
        
        # Show final result
        for i, category in enumerate(processed_data):
            factors_count = len(category.get('factors', []))
            print(f'{i+1}. {category["name"]} ({category["rating"]}) - {factors_count} factors')
            for factor in category.get('factors', [])[:3]:  # Show first 3
                print(f'   - {factor["name"]} -> {factor["profile"]}')
            if factors_count > 3:
                print(f'   ... and {factors_count - 3} more')
        
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_complete()
