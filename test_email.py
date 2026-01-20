import smtplib
from email.mime.text import MIMEText
import os

# Test Gmail credentials locally
gmail_user = "your-gmail@gmail.com"  # Replace with your Gmail
gmail_password = "your-16-char-app-password"  # Replace with valid app password

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(gmail_user, gmail_password)
    print("✅ Gmail authentication successful!")
    server.quit()
except Exception as e:
    print(f"❌ Gmail authentication failed: {e}")