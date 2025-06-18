#!/usr/bin/env python3
"""
Gmail SMTP Email Service for BCP Securities Dashboard
Handles actual email sending via Gmail SMTP
"""

import smtplib
import json
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GmailSMTPService:
    """Gmail SMTP email service for BCP Securities"""
    
    def __init__(self):
        self.smtp_server = None
        
    def send_email(self, email_data):
        """
        Send email via Gmail SMTP
        
        Args:
            email_data (dict): Email configuration and message data
            
        Returns:
            dict: Result with success status and details
        """
        try:
            logger.info("🚀 Starting Gmail SMTP email send...")
            
            # Extract SMTP configuration
            smtp_config = email_data.get('smtp', {})
            message_data = email_data.get('message', {})
            
            # Validate required fields
            if not self._validate_email_data(smtp_config, message_data):
                return {
                    'success': False,
                    'error': 'Invalid email configuration or message data'
                }
            
            # Create message
            msg = self._create_message(message_data)
            
            # Send via SMTP
            result = self._send_via_smtp(smtp_config, message_data, msg)
            
            logger.info(f"✅ Email send result: {result}")
            return result
            
        except Exception as e:
            error_msg = f"Email sending failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            logger.error(traceback.format_exc())
            
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.now().isoformat()
            }
    
    def _validate_email_data(self, smtp_config, message_data):
        """Validate email configuration and message data"""
        
        # Check SMTP config
        required_smtp = ['host', 'port', 'auth']
        for field in required_smtp:
            if field not in smtp_config:
                logger.error(f"Missing SMTP field: {field}")
                return False
        
        # Check auth
        auth = smtp_config.get('auth', {})
        if not auth.get('user') or not auth.get('pass'):
            logger.error("Missing SMTP authentication credentials")
            return False
        
        # Check message data
        required_message = ['from', 'to', 'subject']
        for field in required_message:
            if field not in message_data:
                logger.error(f"Missing message field: {field}")
                return False
        
        return True
    
    def _create_message(self, message_data):
        """Create email message"""
        
        # Create multipart message
        msg = MIMEMultipart('alternative')
        
        # Set headers
        msg['From'] = message_data['from']
        msg['To'] = message_data['to']
        msg['Subject'] = message_data['subject']
        
        if message_data.get('replyTo'):
            msg['Reply-To'] = message_data['replyTo']
        
        # Add text content
        if message_data.get('text'):
            text_part = MIMEText(message_data['text'], 'plain', 'utf-8')
            msg.attach(text_part)
        
        # Add HTML content
        if message_data.get('html'):
            html_part = MIMEText(message_data['html'], 'html', 'utf-8')
            msg.attach(html_part)
        
        return msg
    
    def _send_via_smtp(self, smtp_config, message_data, msg):
        """Send email via SMTP"""
        
        try:
            logger.info(f"📧 Connecting to SMTP server: {smtp_config['host']}:{smtp_config['port']}")
            
            # Create SMTP connection
            if smtp_config.get('secure', False):
                # Use SSL (port 465)
                server = smtplib.SMTP_SSL(smtp_config['host'], smtp_config['port'])
            else:
                # Use TLS (port 587)
                server = smtplib.SMTP(smtp_config['host'], smtp_config['port'])
                server.starttls()
            
            # Enable debug if needed
            # server.set_debuglevel(1)
            
            # Login
            auth = smtp_config['auth']
            logger.info(f"🔐 Authenticating as: {auth['user']}")
            server.login(auth['user'], auth['pass'])
            
            # Extract recipient emails
            to_emails = self._extract_emails(message_data['to'])
            
            # Send email
            logger.info(f"📤 Sending email to: {to_emails}")
            text = msg.as_string()
            server.sendmail(auth['user'], to_emails, text)
            
            # Close connection
            server.quit()
            
            # Generate message ID
            message_id = f"bcp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(text) % 10000}"
            
            logger.info("✅ Email sent successfully via Gmail SMTP")
            
            return {
                'success': True,
                'messageId': message_id,
                'timestamp': datetime.now().isoformat(),
                'service': 'gmail-smtp',
                'recipients': len(to_emails),
                'subject': message_data['subject']
            }
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = "SMTP Authentication failed. Check Gmail address and App Password."
            logger.error(f"❌ {error_msg}: {e}")
            return {
                'success': False,
                'error': error_msg,
                'details': str(e)
            }
            
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error occurred: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg
            }
            
        except Exception as e:
            error_msg = f"Unexpected error sending email: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg
            }
    
    def _extract_emails(self, to_field):
        """Extract email addresses from To field"""
        
        if isinstance(to_field, list):
            return to_field
        
        # Parse comma-separated emails
        emails = []
        for email_part in to_field.split(','):
            email_part = email_part.strip()
            
            # Extract email from "Name <email@domain.com>" format
            if '<' in email_part and '>' in email_part:
                email = email_part.split('<')[1].split('>')[0].strip()
            else:
                email = email_part
            
            if email:
                emails.append(email)
        
        return emails
    
    def test_connection(self, smtp_config):
        """Test SMTP connection without sending email"""
        
        try:
            logger.info("🧪 Testing Gmail SMTP connection...")
            
            # Create SMTP connection
            if smtp_config.get('secure', False):
                server = smtplib.SMTP_SSL(smtp_config['host'], smtp_config['port'])
            else:
                server = smtplib.SMTP(smtp_config['host'], smtp_config['port'])
                server.starttls()
            
            # Test authentication
            auth = smtp_config['auth']
            server.login(auth['user'], auth['pass'])
            
            # Close connection
            server.quit()
            
            logger.info("✅ Gmail SMTP connection test successful")
            return {
                'success': True,
                'message': 'Gmail SMTP connection successful'
            }
            
        except Exception as e:
            error_msg = f"Gmail SMTP connection test failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg
            }

# Global service instance
gmail_service = GmailSMTPService()

def send_email_api(email_data):
    """API endpoint for sending emails"""
    return gmail_service.send_email(email_data)

def test_connection_api(smtp_config):
    """API endpoint for testing SMTP connection"""
    return gmail_service.test_connection(smtp_config)
