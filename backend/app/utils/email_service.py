import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(subject: str, recipient: str, body: str) -> bool:
        # Check if we're in development and SMTP is not properly configured
        if (settings.ENVIRONMENT == "development" and 
            (settings.SMTP_USER.startswith("your_") or 
             "your_app_password" in settings.SMTP_PASSWORD)):
            
            # Simulate email sending in development
            print("\n" + "="*80)
            print("📧 EMAIL SIMULATION (Development Mode)")
            print("="*80)
            print(f"To: {recipient}")
            print(f"Subject: {subject}")
            print(f"From: {settings.FROM_NAME} <{settings.SMTP_USER}>")
            print("-"*80)
            print(body)
            print("="*80)
            print("\n⚠️  To send real emails, configure SMTP settings in .env file")
            print("   See instructions in the .env file for Gmail setup")
            print("\n")
            return True
        
        # Real email sending
        msg = MIMEMultipart()
        from_email = settings.FROM_EMAIL or settings.SMTP_USER
        msg['From'] = f"{settings.FROM_NAME} <{from_email}>"
        msg['To'] = recipient
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        try:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls() if settings.SMTP_TLS else None
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            logger.info(f"Email sent successfully to {recipient}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {e}")
            print(f"Failed to send email: {e}")
            
            # In development, show helpful error message
            if settings.ENVIRONMENT == "development":
                print("\n" + "="*80)
                print("❌ EMAIL SENDING FAILED")
                print("="*80)
                print("To fix this, you need to configure Gmail SMTP:")
                print("1. Go to https://myaccount.google.com/security")
                print("2. Enable 2-Step Verification")
                print("3. Generate App Password: https://myaccount.google.com/apppasswords")
                print("4. Update SMTP_USER and SMTP_PASSWORD in .env file")
                print("="*80 + "\n")
            
            return False

