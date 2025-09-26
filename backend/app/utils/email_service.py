import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings
import logging
from typing import Dict, Any, Optional
from datetime import datetime

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
    
    @staticmethod
    def send_booking_confirmation(
        recipient_email: str,
        booking_data: Dict[str, Any],
        consultant_data: Dict[str, Any],
        client_name: str,
        meeting_url: Optional[str] = None
    ) -> bool:
        """
        Send booking confirmation email with meeting link
        """
        subject = f"Consultation Booking Confirmed - {booking_data.get('id', 'N/A')}"
        
        # Format date and time
        booking_date = booking_data.get('booking_date', '')
        if isinstance(booking_date, str):
            try:
                date_obj = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
                formatted_date = date_obj.strftime('%A, %B %d, %Y')
                formatted_time = date_obj.strftime('%I:%M %p')
                timezone = booking_data.get('timezone', 'America/Toronto')
            except:
                formatted_date = booking_date
                formatted_time = 'Time TBD'
                timezone = 'America/Toronto'
        else:
            formatted_date = 'Date TBD'
            formatted_time = 'Time TBD'
            timezone = 'America/Toronto'
        
        # Meeting section
        meeting_section = ""
        if meeting_url:
            meeting_section = f"""
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0;">
                <h3 style="margin:0 0 15px 0;color:#1e40af;font-size:16px;">📹 Video Meeting Details</h3>
                <p style="margin:0 0 15px 0;color:#374151;">Your consultation will be conducted via secure video meeting:</p>
                <div style="text-align:center;margin:15px 0;">
                    <a href="{settings.FRONTEND_URL}/meeting/{booking_data.get('id', '')}" 
                       style="background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                        🎥 Join Video Meeting
                    </a>
                </div>
                <p style="margin:15px 0 0 0;color:#6b7280;font-size:14px;text-align:center;">
                    You can join the meeting up to 15 minutes before the scheduled time
                </p>
            </div>
            """
        else:
            meeting_section = """
            <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:20px;margin:20px 0;">
                <h3 style="margin:0 0 10px 0;color:#d97706;font-size:16px;">📹 Meeting Room Setup</h3>
                <p style="margin:0;color:#92400e;font-size:14px;">
                    Your video meeting room will be created before your session. You'll receive an email with the meeting link.
                </p>
            </div>
            """
        
        body = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
        </head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:30px;border-radius:10px;text-align:center;margin-bottom:30px;">
                <h1 style="margin:0;font-size:28px;">🎉 Booking Confirmed!</h1>
                <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9;">Your immigration consultation is all set</p>
            </div>
            
            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:25px;margin-bottom:25px;">
                <h2 style="color:#1f2937;margin-top:0;font-size:20px;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">Consultation Details</h2>
                
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Client:</strong> {client_name}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">RCIC Consultant:</strong> {consultant_data.get('name', 'N/A')}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Service:</strong> {booking_data.get('service_name', booking_data.get('service_type', 'Immigration Consultation'))}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Date:</strong> {formatted_date}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Time:</strong> {formatted_time} ({timezone})
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Booking ID:</strong> #{booking_data.get('id', 'N/A')}
                </div>
                <div style="margin-bottom:0;">
                    <strong style="color:#374151;">Total Amount:</strong> ${booking_data.get('total_amount', booking_data.get('price', '0')):.2f} CAD
                </div>
            </div>
            
            {meeting_section}
            
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:25px;margin-bottom:25px;">
                <h3 style="color:#1f2937;margin-top:0;font-size:18px;">📋 What's Next?</h3>
                <ol style="color:#374151;padding-left:20px;">
                    <li style="margin-bottom:8px;"><strong>Review your documents:</strong> Your RCIC will review any documents you've uploaded before the session</li>
                    <li style="margin-bottom:8px;"><strong>Reminder emails:</strong> You'll receive reminders 24 hours and 1 hour before your consultation</li>
                    <li style="margin-bottom:8px;"><strong>Join the meeting:</strong> Use the video meeting link above to join at your scheduled time</li>
                    <li style="margin-bottom:0;"><strong>Professional advice:</strong> Receive expert guidance on your immigration matters</li>
                </ol>
            </div>
            
            <div style="background:#ecfdf5;border:1px solid #10b981;border-radius:8px;padding:20px;margin-bottom:25px;">
                <h3 style="color:#047857;margin-top:0;font-size:16px;">💡 Preparation Tips</h3>
                <ul style="color:#065f46;margin:0;padding-left:20px;">
                    <li>Test your camera and microphone before the meeting</li>
                    <li>Have all relevant documents ready</li>
                    <li>Prepare any questions you'd like to discuss</li>
                    <li>Find a quiet, private space for the consultation</li>
                </ul>
            </div>
            
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;">
                <p style="color:#6b7280;font-size:14px;margin-bottom:15px;">Need help or have questions?</p>
                <p style="color:#6b7280;font-size:14px;margin:0;">
                    Email: <a href="mailto:support@consultations.com" style="color:#3b82f6;">support@consultations.com</a><br>
                    Manage your bookings: <a href="{settings.FRONTEND_URL}/client-dashboard" style="color:#3b82f6;">Client Dashboard</a>
                </p>
            </div>
            
            <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                    This is an automated message from the Immigration Consultations Platform.<br>
                    Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(subject, recipient_email, body)
    
    @staticmethod
    def send_meeting_reminder(
        recipient_email: str,
        booking_data: Dict[str, Any],
        consultant_data: Dict[str, Any],
        client_name: str,
        hours_until: int,
        meeting_url: Optional[str] = None
    ) -> bool:
        """
        Send meeting reminder email
        """
        time_text = f"{hours_until} hour{'s' if hours_until != 1 else ''}"
        subject = f"Reminder: Your consultation in {time_text} - Booking #{booking_data.get('id', 'N/A')}"
        
        # Format date and time
        booking_date = booking_data.get('booking_date', '')
        if isinstance(booking_date, str):
            try:
                date_obj = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
                formatted_date = date_obj.strftime('%A, %B %d, %Y')
                formatted_time = date_obj.strftime('%I:%M %p')
                timezone = booking_data.get('timezone', 'America/Toronto')
            except:
                formatted_date = booking_date
                formatted_time = 'Time TBD'
                timezone = 'America/Toronto'
        else:
            formatted_date = 'Date TBD'
            formatted_time = 'Time TBD'
            timezone = 'America/Toronto'
        
        # Meeting section
        meeting_section = ""
        if meeting_url:
            meeting_section = f"""
            <div style="background:#dbeafe;border:2px solid #3b82f6;border-radius:8px;padding:25px;margin:25px 0;text-align:center;">
                <h2 style="color:#1e40af;margin:0 0 15px 0;font-size:20px;">🎥 Ready to Join?</h2>
                <p style="color:#1e40af;margin:0 0 20px 0;font-size:16px;">Your video meeting is ready!</p>
                <a href="{settings.FRONTEND_URL}/meeting/{booking_data.get('id', '')}" 
                   style="background:#3b82f6;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:18px;display:inline-block;">
                    🎥 Join Video Meeting Now
                </a>
                <p style="color:#64748b;margin:15px 0 0 0;font-size:14px;">
                    You can join up to 15 minutes early
                </p>
            </div>
            """
        else:
            meeting_section = """
            <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
                <h3 style="color:#d97706;margin:0 0 10px 0;font-size:16px;">📹 Meeting Link Coming Soon</h3>
                <p style="color:#92400e;font-size:14px;margin:0;">
                    Your meeting room is being prepared. You'll receive the link shortly.
                </p>
            </div>
            """
        
        body = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Meeting Reminder</title>
        </head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:white;padding:30px;border-radius:10px;text-align:center;margin-bottom:30px;">
                <h1 style="margin:0;font-size:28px;">⏰ Consultation Reminder</h1>
                <p style="margin:10px 0 0 0;font-size:18px;opacity:0.9;">Your meeting starts in {time_text}!</p>
            </div>
            
            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:25px;margin-bottom:25px;">
                <h2 style="color:#1f2937;margin-top:0;font-size:20px;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">Meeting Details</h2>
                
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Client:</strong> {client_name}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">RCIC Consultant:</strong> {consultant_data.get('name', 'N/A')}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Service:</strong> {booking_data.get('service_name', booking_data.get('service_type', 'Immigration Consultation'))}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Date:</strong> {formatted_date}
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="color:#374151;">Time:</strong> {formatted_time} ({timezone})
                </div>
                <div style="margin-bottom:0;">
                    <strong style="color:#374151;">Booking ID:</strong> #{booking_data.get('id', 'N/A')}
                </div>
            </div>
            
            {meeting_section}
            
            <div style="background:#f0f9ff;border:1px solid #0ea5e9;border-radius:8px;padding:20px;margin-bottom:25px;">
                <h3 style="color:#0369a1;margin-top:0;font-size:16px;">✅ Final Checklist</h3>
                <ul style="color:#0c4a6e;margin:0;padding-left:20px;">
                    <li>Camera and microphone are working</li>
                    <li>Internet connection is stable</li>
                    <li>Documents and questions are ready</li>
                    <li>You're in a quiet, private space</li>
                </ul>
            </div>
            
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;">
                <p style="color:#6b7280;font-size:14px;margin-bottom:15px;">Need to reschedule or have questions?</p>
                <p style="color:#6b7280;font-size:14px;margin:0;">
                    Visit your <a href="{settings.FRONTEND_URL}/client-dashboard" style="color:#3b82f6;">Client Dashboard</a><br>
                    Or email: <a href="mailto:support@consultations.com" style="color:#3b82f6;">support@consultations.com</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(subject, recipient_email, body)
