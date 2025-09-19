from flask import Flask, render_template, request, flash, redirect, url_for
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
# Environment variables are loaded directly from the platform on Render
# load_dotenv() is only needed for local development with .env files

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Debug: Print form data
        print(f"=== CONTACT FORM DEBUG ===")
        print(f"Form data received: {dict(request.form)}")
        print(f"Content type: {request.content_type}")
        print(f"Method: {request.method}")

        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()

        print(f"Parsed fields: name='{name}', email='{email}', subject='{subject}', message='{message}'")

        # Validate form fields
        if not all([name, email, subject, message]):
            print("ERROR: Missing required fields")
            flash('All fields are required. Please fill out the entire form.', 'error')
            return redirect(url_for('contact'))

        # Get Gmail credentials
        gmail_user = os.environ.get('GMAIL_USER')
        gmail_password = os.environ.get('GMAIL_APP_PASSWORD')

        if not gmail_user or not gmail_password:
            print("ERROR: Gmail credentials not configured")
            flash('Email service is not configured. Please contact the administrator.', 'error')
            return redirect(url_for('contact'))

        print(f"Gmail credentials found: {gmail_user[:5]}...@gmail.com")
        print("Attempting to send email using smtplib...")

        try:
            # Create message using the same approach as your working test app
            msg = MIMEMultipart()
            msg['From'] = gmail_user
            msg['To'] = 'contact@abdulhakeem.dev'
            msg['Subject'] = f"Portfolio Contact: {subject}"

            body = f"""
New message from your portfolio website:

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
            """

            msg.attach(MIMEText(body, 'plain'))

            print("Connecting to Gmail SMTP server...")
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            print("Starting authentication...")
            server.login(gmail_user, gmail_password)
            print("Authentication successful! Sending email...")
            text = msg.as_string()
            server.sendmail(gmail_user, 'contact@abdulhakeem.dev', text)
            server.quit()

            print("EMAIL SENT SUCCESSFULLY!")
            flash('Your message has been sent successfully!', 'success')
            return redirect(url_for('contact'))

        except Exception as e:
            # Log the actual error for debugging
            print(f"=== EMAIL SENDING ERROR ===")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Full error: {repr(e)}")

            # Provide specific error messages
            if "Authentication" in str(e) or "Username and Password not accepted" in str(e):
                error_msg = 'Email authentication failed. Please contact the administrator.'
                flash(error_msg, 'error')
            elif "SMTP" in str(e) or "Connection" in str(e):
                error_msg = 'Unable to connect to email server. Please try again later.'
                flash(error_msg, 'error')
            else:
                error_msg = f'Email sending failed: {str(e)}'
                flash(error_msg, 'error')

            print(f"Flash message set: {error_msg}")
            return redirect(url_for('contact'))

    return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)