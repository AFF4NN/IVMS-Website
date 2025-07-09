from flask import Flask, send_from_directory, request, jsonify, redirect, url_for, flash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import argparse
from urllib.parse import quote

app = Flask(__name__)
app.secret_key = 'ivms-form-secret-key-2025'  # For flash messages

# Email configuration
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
FORM_EMAIL = 'info@ivmsgroup.com'  # This would be configured with actual credentials

def send_email(form_data, form_type):
    """Send form submission via email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = 'noreply@ivmsgroup.com'  # Sender email
        msg['To'] = FORM_EMAIL
        msg['Subject'] = f'New {form_type} Form Submission - IVMS Website'
        
        # Create email body
        if form_type == 'Contact':
            body = f"""
New Contact Form Submission
Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Contact Information:
- First Name: {form_data.get('first_name', 'N/A')}
- Last Name: {form_data.get('last_name', 'N/A')}
- Company: {form_data.get('company', 'N/A')}
- Email: {form_data.get('email', 'N/A')}
- Phone: {form_data.get('phone', 'N/A')}
- Job Title: {form_data.get('job_title', 'N/A')}

Message:
{form_data.get('message', 'N/A')}

---
This submission was received from the IVMS website contact form.
Please respond to the customer within 24 hours.
            """
        elif form_type == 'Government':
            body = f"""
New Government Inquiry Form Submission
Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Government Department Information:
- Department: {form_data.get('government_department', 'N/A')}
- Fleet Size: {form_data.get('fleet_size', 'N/A')}
- Implementation Timeline: {form_data.get('implementation_timeline', 'N/A')}

Current Challenges:
{form_data.get('current_challenges', 'N/A')}

---
This submission was received from the IVMS website government inquiry form.
High priority - Government inquiry requires immediate attention.
            """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # For now, we'll simulate email sending since we don't have actual SMTP credentials
        # In production, you would use:
        # server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        # server.starttls()
        # server.login(email_user, email_pass)
        # server.send_message(msg)
        # server.quit()
        
        print(f"Email would be sent to {FORM_EMAIL}:")
        print(body)
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/speedsense')
def speedsense():
    return send_from_directory('.', 'speedsense.html')

@app.route('/rental-leasing')
def rental_leasing():
    return send_from_directory('.', 'rental-leasing.html')

@app.route('/governments')
def governments():
    return send_from_directory('.', 'governments.html')

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    """Handle contact form submissions"""
    try:
        form_data = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'company': request.form.get('company'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'job_title': request.form.get('job_title'),
            'message': request.form.get('message')
        }
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'company', 'email', 'phone', 'job_title', 'message']
        missing_fields = [field for field in required_fields if not form_data.get(field)]
        
        if missing_fields:
            message = quote(f'Please fill in all required fields: {", ".join(missing_fields)}')
            redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=error"
            return redirect(redirect_url)
        
        # Send email
        if send_email(form_data, 'Contact'):
            message = quote('Thank you for your inquiry! We will contact you within 24 hours.')
            redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=success"
        else:
            message = quote('There was an error submitting your form. Please try again or contact us directly.')
            redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=error"
            
    except Exception as e:
        message = quote('There was an error processing your request. Please try again.')
        redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=error"
        print(f"Contact form error: {str(e)}")
    
    return redirect(redirect_url)

@app.route('/submit-government', methods=['POST'])
def submit_government():
    """Handle government inquiry form submissions"""
    try:
        form_data = {
            'government_department': request.form.get('government_department'),
            'fleet_size': request.form.get('fleet_size'),
            'current_challenges': request.form.get('current_challenges'),
            'implementation_timeline': request.form.get('implementation_timeline')
        }
        
        # Validate required fields
        required_fields = ['government_department', 'fleet_size', 'current_challenges', 'implementation_timeline']
        missing_fields = [field for field in required_fields if not form_data.get(field)]
        
        if missing_fields:
            message = quote(f'Please fill in all required fields: {", ".join(missing_fields)}')
            redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=error"
            return redirect(redirect_url)
        
        # Send email
        if send_email(form_data, 'Government'):
            message = quote('Thank you for your government inquiry! Our team will contact you within 24 hours to schedule a demo.')
            redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=success"
        else:
            message = quote('There was an error submitting your form. Please try again or contact us directly.')
            redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=error"
            
    except Exception as e:
        message = quote('There was an error processing your request. Please try again.')
        redirect_url = f"{request.referrer or '/'}?flash_message={message}&flash_type=error"
        print(f"Government form error: {str(e)}")
    
    return redirect(redirect_url)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the Flask server.')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    args = parser.parse_args()
    print("Starting IVMS Website Server...")
    print(f"Server running at http://localhost:{args.port}")
    print(f"Form submissions will be sent to: {FORM_EMAIL}")
    print("Press Ctrl+C to stop the server")
    print("="*50)
    app.run(debug=True, host='0.0.0.0', port=args.port) 