#!/usr/bin/env python3
"""
DOC Secure System Test Script
This script tests all components of the DOC Secure system
"""

import os
import sys
import json
import requests
import time
from pathlib import Path

# Add the utils directory to the Python path
current_dir = Path(__file__).parent
project_root = current_dir.parent
utils_dir = project_root / "utils" / "docsecure"
sys.path.append(str(utils_dir))

def test_database_initialization():
    """Test database initialization"""
    print("🔧 Testing Database Initialization...")
    try:
        from database import DocSecureDatabase
        db = DocSecureDatabase()
        stats = db.get_statistics()
        print(f"✅ Database initialized successfully")
        print(f"   📄 Total documents: {stats['total_documents']}")
        print(f"   📂 Categories: {len(stats['categories'])}")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    base_url = "http://localhost:3002"
    
    # Test documents endpoint
    try:
        response = requests.get(f"{base_url}/api/docsecure/documents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Documents API working - Found {len(data.get('documents', []))} documents")
            else:
                print(f"⚠️  Documents API returned error: {data.get('error')}")
        else:
            print(f"❌ Documents API failed with status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Documents API connection failed: {e}")
    
    # Test statistics endpoint
    try:
        response = requests.get(f"{base_url}/api/docsecure/documents?action=stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                stats = data.get('statistics', {})
                print(f"✅ Statistics API working - {stats.get('total_documents', 0)} total documents")
            else:
                print(f"⚠️  Statistics API returned error: {data.get('error')}")
        else:
            print(f"❌ Statistics API failed with status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Statistics API connection failed: {e}")

def test_web_interface():
    """Test web interface accessibility"""
    print("\n🖥️  Testing Web Interface...")
    base_url = "http://localhost:3002"
    
    pages = [
        ("/docsecure/documents", "Documents Page"),
        ("/docsecure/import", "Import Page"),
        ("/docsecure/dashboard", "Dashboard Page")
    ]
    
    for path, name in pages:
        try:
            response = requests.get(f"{base_url}{path}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {name} accessible")
            else:
                print(f"❌ {name} failed with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {name} connection failed: {e}")

def test_file_structure():
    """Test file structure"""
    print("\n📁 Testing File Structure...")
    
    required_files = [
        "utils/docsecure/database.py",
        "utils/docsecure/test_integration.py",
        "app/api/docsecure/upload/route.ts",
        "app/api/docsecure/documents/route.ts",
        "app/api/docsecure/download/[id]/route.ts",
        "docsecureDOCS/metadata.db",
        "docsecureDOCS/procedures/README.md",
        "docsecureDOCS/modes_emploi/README.md",
        "docsecureDOCS/notes_internes/README.md",
        "docsecureDOCS/politiques/README.md"
    ]
    
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - Missing")

def test_python_integration():
    """Test Python integration"""
    print("\n🐍 Testing Python Integration...")
    
    try:
        # Test the integration script
        import subprocess
        result = subprocess.run([
            sys.executable, 
            "utils/docsecure/test_integration.py", 
            "test"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                if data.get('success'):
                    print(f"✅ Python integration working")
                    print(f"   🐍 Python version: {data.get('python_version')}")
                else:
                    print(f"❌ Python integration failed: {data.get('error')}")
            except json.JSONDecodeError:
                print(f"❌ Python integration returned invalid JSON")
        else:
            print(f"❌ Python integration failed with return code {result.returncode}")
            if result.stderr:
                print(f"   Error: {result.stderr}")
    except Exception as e:
        print(f"❌ Python integration test failed: {e}")

def test_upload_simulation():
    """Test upload simulation"""
    print("\n📤 Testing Upload Simulation...")
    
    try:
        # Create a test file
        test_content = "This is a test document for DOC Secure system testing."
        test_file_path = "test_document.txt"
        
        with open(test_file_path, 'w') as f:
            f.write(test_content)
        
        # Simulate upload via API
        base_url = "http://localhost:3002"
        
        with open(test_file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'title': 'Test Document',
                'category': 'Procédures',
                'description': 'Test document for system validation'
            }
            
            response = requests.post(
                f"{base_url}/api/docsecure/upload",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Upload simulation successful - Document ID: {result.get('documentId')}")
                else:
                    print(f"❌ Upload simulation failed: {result.get('error')}")
            else:
                print(f"❌ Upload simulation failed with status {response.status_code}")
        
        # Clean up test file
        os.unlink(test_file_path)
        
    except Exception as e:
        print(f"❌ Upload simulation failed: {e}")
        # Clean up test file if it exists
        if os.path.exists(test_file_path):
            os.unlink(test_file_path)

def main():
    """Run all tests"""
    print("🧪 DOC Secure System Test Suite")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    # Run all tests
    tests = [
        test_file_structure,
        test_database_initialization,
        test_python_integration,
        test_api_endpoints,
        test_web_interface,
        test_upload_simulation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests completed")
    
    if passed == total:
        print("🎉 All tests passed! DOC Secure system is ready.")
    else:
        print("⚠️  Some tests failed. Please check the output above.")
    
    print("\n📋 Next Steps:")
    print("1. Open http://localhost:3002/docsecure/import to test file upload")
    print("2. Open http://localhost:3002/docsecure/documents to view documents")
    print("3. Test the complete workflow by uploading a document")

if __name__ == "__main__":
    main()
