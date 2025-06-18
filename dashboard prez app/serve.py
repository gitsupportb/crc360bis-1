#!/usr/bin/env python3
"""
BCP Securities Services - Enhanced HTTP Server
Serves the dashboard files with Docker support and production features
"""

import http.server
import socketserver
import ssl
import os
import sys
import webbrowser
import signal
import logging
import json
import urllib.parse
from pathlib import Path
from datetime import datetime
from email_service import send_email_api, test_connection_api

def setup_logging():
    """Configure logging for the application"""
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    # Create logs directory if it doesn't exist
    log_dir = Path('/app/logs') if Path('/app/logs').exists() else Path('./logs')
    log_dir.mkdir(exist_ok=True)

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, log_level, logging.INFO),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_dir / 'dashboard.log')
        ]
    )

    return logging.getLogger(__name__)

def get_config():
    """Get configuration from environment variables"""
    return {
        'PORT': int(os.getenv('PORT', 8000)),
        'HOST': os.getenv('HOST', '0.0.0.0'),  # Changed for Docker
        'ENV': os.getenv('DASHBOARD_ENV', 'development'),
        'DEBUG': os.getenv('DEBUG_MODE', 'false').lower() == 'true',
        'MAX_CONNECTIONS': int(os.getenv('MAX_CONNECTIONS', 100)),
        'REQUEST_TIMEOUT': int(os.getenv('REQUEST_TIMEOUT', 30)),
        'ENABLE_HTTPS': os.getenv('ENABLE_HTTPS', 'false').lower() == 'true',
        'SSL_CERT_PATH': os.getenv('SSL_CERT_PATH', '/app/certs/cert.pem'),
        'SSL_KEY_PATH': os.getenv('SSL_KEY_PATH', '/app/certs/key.pem')
    }

def main():
    # Setup logging
    logger = setup_logging()

    # Get configuration
    config = get_config()
    PORT = config['PORT']
    HOST = config['HOST']

    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()

    logger.info("🏦 BCP Securities Services - Enhanced Server Starting")
    logger.info("=" * 60)
    logger.info(f"📁 Serving files from: {script_dir}")
    logger.info(f"🌐 Server address: http://{HOST}:{PORT}")
    logger.info(f"🔧 Environment: {config['ENV']}")
    logger.info("=" * 60)

    # Change to the script directory
    os.chdir(script_dir)

    # Check for required files
    required_files = [
        'ALL_REPORTINGS.json',
        'reporting-data-manager.js',
        'complete_dashboard.html'
    ]

    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)

    if missing_files:
        logger.warning("⚠️  Some required files are missing:")
        for file in missing_files:
            logger.warning(f"   - {file}")

    # Available pages
    available_pages = []
    main_pages = [
        ('Main Dashboard', 'complete_dashboard.html'),
        ('Data Manager Test', 'test-centralized-data.html'),
        ('Simple Test', 'test-simple.html'),
        ('Email Admin', 'email-admin.html')
    ]

    for name, file in main_pages:
        if Path(file).exists():
            available_pages.append((name, file))

    logger.info("📋 Available pages:")
    for name, file in available_pages:
        logger.info(f"   🔗 {name}: http://{HOST}:{PORT}/{file}")

    # Enhanced HTTP Request Handler with security and logging
    class EnhancedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.logger = logging.getLogger(f"{__name__}.RequestHandler")
            super().__init__(*args, **kwargs)

        def end_headers(self):
            # Add security headers
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('X-Frame-Options', 'DENY')
            self.send_header('X-XSS-Protection', '1; mode=block')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()

        def do_OPTIONS(self):
            self.send_response(200)
            self.end_headers()

        def do_POST(self):
            # Handle email API endpoints
            if self.path == '/api/send-email':
                self.handle_send_email()
                return
            elif self.path == '/api/test-smtp':
                self.handle_test_smtp()
                return
            elif self.path == '/api/upload-file':
                self.handle_file_upload()
                return
            else:
                self.send_error(404, "API endpoint not found")

        def handle_send_email(self):
            """Handle email sending API"""
            try:
                # Get content length
                content_length = int(self.headers.get('Content-Length', 0))

                # Read and parse JSON data
                post_data = self.rfile.read(content_length)
                email_data = json.loads(post_data.decode('utf-8'))

                self.logger.info("📧 Received email send request")

                # Send email using the email service
                result = send_email_api(email_data)

                # Send response
                self.send_response(200 if result['success'] else 500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())

                if result['success']:
                    self.logger.info(f"✅ Email sent successfully: {result.get('messageId', 'N/A')}")
                else:
                    self.logger.error(f"❌ Email sending failed: {result.get('error', 'Unknown error')}")

            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON data")
            except Exception as e:
                self.logger.error(f"❌ Error handling email request: {e}")
                self.send_error(500, f"Internal server error: {str(e)}")

        def handle_test_smtp(self):
            """Handle SMTP connection test API"""
            try:
                # Get content length
                content_length = int(self.headers.get('Content-Length', 0))

                # Read and parse JSON data
                post_data = self.rfile.read(content_length)
                smtp_config = json.loads(post_data.decode('utf-8'))

                self.logger.info("🧪 Received SMTP test request")

                # Test SMTP connection
                result = test_connection_api(smtp_config)

                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())

                if result['success']:
                    self.logger.info("✅ SMTP test successful")
                else:
                    self.logger.error(f"❌ SMTP test failed: {result.get('error', 'Unknown error')}")

            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON data")
            except Exception as e:
                self.logger.error(f"❌ Error handling SMTP test: {e}")
                self.send_error(500, f"Internal server error: {str(e)}")

        def handle_file_upload(self):
            """Handle hierarchical file upload API"""
            try:
                # Get content length
                content_length = int(self.headers.get('Content-Length', 0))

                # Read and parse JSON data
                post_data = self.rfile.read(content_length)
                upload_data = json.loads(post_data.decode('utf-8'))

                self.logger.info("📤 Received file upload request")

                # Extract upload parameters
                authority = upload_data.get('authority')
                category = upload_data.get('category')
                report = upload_data.get('report')
                year = upload_data.get('year')
                month = upload_data.get('month')
                filename = upload_data.get('filename')
                file_data = upload_data.get('fileData')

                # Validate required parameters
                if not all([authority, category, report, year, month, filename, file_data]):
                    self.send_error(400, "Missing required upload parameters")
                    return

                # Process the upload
                result = self.process_hierarchical_upload(
                    authority, category, report, year, month, filename, file_data
                )

                # Send response
                self.send_response(200 if result['success'] else 500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())

                if result['success']:
                    self.logger.info(f"✅ File uploaded successfully: {result.get('path', 'N/A')}")
                else:
                    self.logger.error(f"❌ File upload failed: {result.get('error', 'Unknown error')}")

            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON data")
            except Exception as e:
                self.logger.error(f"❌ Error handling file upload: {e}")
                self.send_error(500, f"Internal server error: {str(e)}")

        def process_hierarchical_upload(self, authority, category, report, year, month, filename, file_data):
            """Process file upload with hierarchical folder structure"""
            try:
                import base64
                import os
                from pathlib import Path

                # Clean folder names
                def clean_folder_name(name):
                    return name.replace(' ', '_').replace('/', '_').replace('\\', '_')

                # Get category folder name based on authority
                def get_category_folder_name(auth, cat):
                    if auth == "BAM":
                        category_map = {
                            "I": "I___Situation_comptable_et_états_annexes",
                            "II": "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires",
                            "III": "III___Etats_relatifs_à_la_réglementation_prudentielle"
                        }
                        return category_map.get(cat, cat)
                    return cat

                # Get report folder name from ALL_REPORTINGS.json
                def get_report_folder_name(auth, cat, report_key):
                    try:
                        # Load ALL_REPORTINGS.json to get the correct folder name
                        all_reportings_path = Path.cwd() / "ALL_REPORTINGS.json"
                        if all_reportings_path.exists():
                            with open(all_reportings_path, 'r', encoding='utf-8') as f:
                                all_reportings = json.load(f)

                            categories = all_reportings.get('categories', {})

                            if auth == "BAM" and cat in categories:
                                reportings = categories[cat].get('reportings', {})
                                if report_key in reportings:
                                    return reportings[report_key].get('folderName', clean_folder_name(report_key))
                            elif auth == "AMMC":
                                # Map AMMC categories
                                ammc_category_map = {
                                    "BCP": "AMMC_BCP",
                                    "BCP2S": "AMMC_BCP2S",
                                    "BANK_AL_YOUSR": "AMMC_BANK_AL_YOUSR"
                                }
                                ammc_category_key = ammc_category_map.get(cat)
                                if ammc_category_key and ammc_category_key in categories:
                                    reportings = categories[ammc_category_key].get('reportings', {})
                                    if report_key in reportings:
                                        return reportings[report_key].get('folderName', clean_folder_name(report_key))
                            elif auth == "DGI" and "DGI" in categories:
                                reportings = categories["DGI"].get('reportings', {})
                                if report_key in reportings:
                                    return reportings[report_key].get('folderName', clean_folder_name(report_key))
                    except Exception as e:
                        self.logger.warning(f"⚠️ Could not load report folder name from ALL_REPORTINGS.json: {e}")

                    # Fallback to cleaned report key
                    return clean_folder_name(report_key)

                # Remove data URL prefix if present
                if file_data.startswith("data:"):
                    file_data = file_data.split(",")[1]

                # Decode base64 file data
                file_bytes = base64.b64decode(file_data)

                # Build hierarchical folder structure
                authority_folder = clean_folder_name(authority)
                category_folder = clean_folder_name(get_category_folder_name(authority, category))
                report_folder = get_report_folder_name(authority, category, report)

                # Create full path
                base_dir = Path.cwd()
                folder_path = base_dir / "UPLOADED_REPORTINGS" / authority_folder / category_folder / report_folder / str(year) / str(month)

                # Create directories if they don't exist
                folder_path.mkdir(parents=True, exist_ok=True)

                # Write file
                file_path = folder_path / filename
                with open(file_path, "wb") as f:
                    f.write(file_bytes)

                # Log the upload
                self.log_upload_event(authority, category, report, year, month, filename, str(file_path))

                # Update file listing after successful upload
                self.update_file_listing()

                return {
                    'success': True,
                    'message': f'File uploaded successfully to {file_path}',
                    'path': str(file_path),
                    'authority': authority,
                    'category': category,
                    'report': report
                }

            except Exception as e:
                return {
                    'success': False,
                    'error': str(e)
                }

        def log_upload_event(self, authority, category, report, year, month, filename, file_path):
            """Log upload event to upload log file"""
            try:
                import json
                from datetime import datetime
                from pathlib import Path

                log_entry = {
                    "timestamp": datetime.now().isoformat(),
                    "authority": authority,
                    "category": category,
                    "report": report,
                    "year": year,
                    "month": month,
                    "filename": filename,
                    "file_path": file_path
                }

                log_file_path = Path.cwd() / "UPLOADED_REPORTINGS" / "upload_log.json"

                # Read existing logs or create new structure
                if log_file_path.exists():
                    with open(log_file_path, "r", encoding="utf-8") as f:
                        try:
                            log_data = json.load(f)
                            # Handle both old list format and new dict format
                            if isinstance(log_data, list):
                                # Old format - convert to new format
                                logs = log_data
                            elif isinstance(log_data, dict) and "uploads" in log_data:
                                # New format - extract uploads array
                                logs = log_data["uploads"]
                            else:
                                # Unknown format - start fresh
                                logs = []
                        except:
                            logs = []
                else:
                    logs = []

                # Add new log entry
                logs.append(log_entry)

                # Save logs in new format
                log_file_path.parent.mkdir(parents=True, exist_ok=True)
                log_structure = {
                    "info": "Upload log for BCP Securities Services reporting files",
                    "created": datetime.now().isoformat(),
                    "status": "active",
                    "uploads": logs
                }
                with open(log_file_path, "w", encoding="utf-8") as f:
                    json.dump(log_structure, f, indent=2, ensure_ascii=False)

            except Exception as e:
                self.logger.warning(f"⚠️ Could not log upload event: {e}")

        def update_file_listing(self):
            """Update the file_listing.json after a file upload"""
            try:
                import subprocess
                import os
                from pathlib import Path

                # Get the path to the generate-file-listing.py script
                script_path = Path.cwd() / "generate-file-listing.py"

                if script_path.exists():
                    self.logger.info("🔄 Updating file listing after upload...")

                    # Run the generate-file-listing.py script
                    result = subprocess.run(
                        [sys.executable, str(script_path)],
                        capture_output=True,
                        text=True,
                        cwd=Path.cwd()
                    )

                    if result.returncode == 0:
                        self.logger.info("✅ File listing updated successfully")
                    else:
                        self.logger.warning(f"⚠️ File listing update failed: {result.stderr}")
                else:
                    self.logger.warning("⚠️ generate-file-listing.py script not found")

            except Exception as e:
                self.logger.warning(f"⚠️ Could not update file listing: {e}")

        def do_GET(self):
            # Add health check endpoint
            if self.path == '/health':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                health_data = {
                    'status': 'healthy',
                    'timestamp': datetime.now().isoformat(),
                    'version': '1.0.0',
                    'environment': config['ENV']
                }
                self.wfile.write(json.dumps(health_data).encode())
                return

            # Redirect root to main dashboard
            if self.path == '/':
                self.send_response(302)
                self.send_header('Location', '/complete_dashboard.html')
                self.end_headers()
                return

            super().do_GET()

        def log_message(self, format, *args):
            # Enhanced logging with proper log levels
            message = format % args
            if '200' in message:
                self.logger.info(f"✅ {message}")
            elif '404' in message:
                self.logger.warning(f"❌ {message}")
            elif '500' in message:
                self.logger.error(f"🚨 {message}")
            else:
                self.logger.info(f"📡 {message}")

    # Signal handler for graceful shutdown
    def signal_handler(signum, frame):
        logger.info(f"📡 Received signal {signum}, shutting down gracefully...")
        sys.exit(0)

    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        # Create server with enhanced handler
        with socketserver.TCPServer((HOST, PORT), EnhancedHTTPRequestHandler) as httpd:

            # Configure HTTPS if enabled
            if config['ENABLE_HTTPS']:
                if os.path.exists(config['SSL_CERT_PATH']) and os.path.exists(config['SSL_KEY_PATH']):
                    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                    context.load_cert_chain(config['SSL_CERT_PATH'], config['SSL_KEY_PATH'])
                    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
                    protocol = "https"
                    logger.info(f"🔒 SSL/HTTPS enabled with certificates")
                else:
                    logger.warning(f"⚠️  SSL certificates not found, falling back to HTTP")
                    protocol = "http"
            else:
                protocol = "http"

            logger.info(f"🚀 Server starting on {protocol}://{HOST}:{PORT}")
            logger.info("📝 Press Ctrl+C to stop the server")

            # Only try to open browser in development mode and not in Docker
            is_docker = os.path.exists('/.dockerenv') or os.getenv('DASHBOARD_ENV') == 'production'

            if not is_docker and config['ENV'] == 'development':
                try:
                    if available_pages:
                        # Open the main dashboard by default
                        url = f"{protocol}://{HOST}:{PORT}/complete_dashboard.html"
                        logger.info(f"🌐 Opening browser to: {url}")
                        webbrowser.open(url)
                    else:
                        logger.info(f"🌐 Open your browser to: {protocol}://{HOST}:{PORT}")
                except Exception as e:
                    logger.warning(f"⚠️  Could not open browser automatically: {e}")
                    logger.info(f"🌐 Please open your browser to: {protocol}://{HOST}:{PORT}")

            if config['ENV'] == 'development':
                logger.info("")
                logger.info("🔍 Development Mode Instructions:")
                logger.info("1. Navigate to the main dashboard")
                logger.info("2. Check that all features work correctly")
                logger.info("3. Monitor logs for any issues")
                logger.info("4. Use /health endpoint for health checks")
                logger.info("")

            # Start serving
            logger.info("🎯 Server ready to accept connections")
            httpd.serve_forever()

    except KeyboardInterrupt:
        logger.info("\n👋 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if "Address already in use" in str(e):
            logger.error(f"❌ Port {PORT} is already in use.")
            logger.error(f"💡 Try a different port or stop the existing server.")
            logger.error(f"🔧 You can also try: python serve.py {PORT + 1}")
        else:
            logger.error(f"❌ Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Allow custom port as command line argument
    if len(sys.argv) > 1:
        try:
            PORT = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 8000.")

    main()
