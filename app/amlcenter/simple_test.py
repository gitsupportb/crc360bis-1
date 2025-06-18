from process_excel import process_excel_file

result = process_excel_file('uploads/excelFile-1749850385370.xlsx')
if 'clients' in result:
    for client in result['clients']:
        if client.get('sheetName') == 'BAA':
            print('=== BAA CLIENT ===')
            print(f'Name: {client["name"]}')
            if 'processedRiskTable' in client:
                print('=== RISK TABLE ===')
                for cat in client['processedRiskTable'][:2]:  # First 2 categories
                    print(f'Category: {cat["name"]}')
                    for factor in cat.get('factors', [])[:3]:  # First 3 factors
                        print(f'  Factor: {factor["name"]}')
                        print(f'  Profile: "{factor["profile"]}"')
            break
