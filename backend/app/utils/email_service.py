import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

class EmailService:
    @staticmethod
    def send_email(subject: str, recipient: str, body: str) -> bool:
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
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

