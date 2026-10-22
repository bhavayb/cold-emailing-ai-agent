import smtplib
import ssl
from email.message import EmailMessage
from config.settings import SENDER_EMAIL, SENDER_APP_PASSWORD


def send_single_email(to_email: str, subject: str, body: str) -> dict:
    """Sends a 1-on-1 email via Gmail SMTP (Port 587 STARTTLS)."""
    clean_password = (SENDER_APP_PASSWORD or "").replace(" ", "")

    if not SENDER_EMAIL or not clean_password:
        return {
            "success": False,
            "error": "Missing SENDER_EMAIL or SENDER_APP_PASSWORD in backend/.env",
        }

    msg = EmailMessage()
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        # Use Port 587 with STARTTLS (works much better on Windows & campus networks)
        context = ssl.create_default_context()
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(SENDER_EMAIL, clean_password)
            server.send_message(msg)

        print(f"   [MAILER] 📨 Successfully sent email to {to_email}!", flush=True)
        return {"success": True, "to": to_email}

    except Exception as e:
        print(f"   [MAILER] ❌ Failed to send to {to_email}: {e}", flush=True)
        return {"success": False, "to": to_email, "error": str(e)}