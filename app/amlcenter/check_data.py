#!/usr/bin/env python3
"""
Check specific data in Excel file
"""

import openpyxl

def check_data():
    wb = openpyxl.load_workbook('uploads/excelFile-1749849010039.xlsx')
    sheet = wb['RED MED ASSET MANAGEMENT']

    # Check rows 13, 14, and 19 (problematic rows)
    for row in [13, 14, 19]:
        print(f'Row {row}:')
        for col in range(1, 6):
            cell = sheet.cell(row=row, column=col)
            print(f'  Column {col}: "{cell.value}"')
        print()

if __name__ == "__main__":
    check_data()
