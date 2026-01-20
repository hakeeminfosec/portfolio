from flask import Flask, render_template, request, flash, redirect, url_for
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = Flask(__name__, template_folder='../templates', static_folder='../static')
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
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()

        # Validate form fields
        if not all([name, email, subject, message]):
            flash('All fields are required. Please fill out the entire form.', 'error')
            return redirect(url_for('contact'))

        # Get Gmail credentials
        gmail_user = os.environ.get('GMAIL_USER')
        gmail_password = os.environ.get('GMAIL_APP_PASSWORD')

        if not gmail_user or not gmail_password:
            flash('Email service is not configured. Please contact the administrator.', 'error')
            return redirect(url_for('contact'))

        try:
            # Create message
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

            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(gmail_user, gmail_password)
            text = msg.as_string()
            server.sendmail(gmail_user, 'contact@abdulhakeem.dev', text)
            server.quit()

            flash('Your message has been sent successfully!', 'success')
            return redirect(url_for('contact'))

        except Exception as e:
            if "Authentication" in str(e) or "Username and Password not accepted" in str(e):
                flash('Email authentication failed. Please contact the administrator.', 'error')
            elif "SMTP" in str(e) or "Connection" in str(e):
                flash('Unable to connect to email server. Please try again later.', 'error')
            else:
                flash(f'Email sending failed: {str(e)}', 'error')
            return redirect(url_for('contact'))

    return render_template('contact.html')

# Required for Vercel
app = app
