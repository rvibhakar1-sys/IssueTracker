import os
from flask import render_template, request, redirect, url_for, flash, send_from_directory
from werkzeug.utils import secure_filename
from app import app, db
from models import Issue
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    # Get filter parameters
    status_filter = request.args.get('status', 'all')
    category_filter = request.args.get('category', 'all')
    search_query = request.args.get('search', '')
    
    # Build query
    query = Issue.query
    
    if status_filter != 'all':
        query = query.filter_by(status=status_filter)
    
    if category_filter != 'all':
        query = query.filter_by(category=category_filter)
    
    if search_query:
        search_term = f'%{search_query}%'
        query = query.filter(
            db.or_(
                Issue.title.ilike(search_term),
                Issue.description.ilike(search_term),
                Issue.location_text.ilike(search_term)
            )
        )
    
    # Order by creation date (newest first)
    issues = query.order_by(Issue.created_at.desc()).all()
    
    # Get statistics
    stats = Issue.get_status_counts()
    
    # Get unique categories for filter dropdown
    categories = db.session.query(Issue.category).distinct().filter(Issue.category.isnot(None)).all()
    categories = [cat[0] for cat in categories if cat[0]]
    
    return render_template('index.html', 
                         issues=issues, 
                         stats=stats,
                         categories=categories,
                         current_status=status_filter,
                         current_category=category_filter,
                         search_query=search_query)

@app.route('/report', methods=['GET', 'POST'])
def report():
    if request.method == 'POST':
        try:
            # Get form data
            title = request.form.get('title', '').strip()
            description = request.form.get('description', '').strip()
            location_text = request.form.get('location_text', '').strip()
            latitude = request.form.get('latitude')
            longitude = request.form.get('longitude')
            reporter_name = request.form.get('reporter_name', '').strip()
            reporter_email = request.form.get('reporter_email', '').strip()
            reporter_phone = request.form.get('reporter_phone', '').strip()
            category = request.form.get('category', '').strip()
            priority = request.form.get('priority', 'Medium')
            
            # Validate required fields
            if not title or not description:
                flash('Title and description are required.', 'error')
                return render_template('report.html')
            
            # Convert coordinates to float if provided
            try:
                if latitude and longitude:
                    latitude = float(latitude)
                    longitude = float(longitude)
                else:
                    latitude = longitude = None
            except ValueError:
                latitude = longitude = None
            
            # Handle photo upload
            photo_filename = None
            if 'photo' in request.files:
                file = request.files['photo']
                if file and file.filename != '' and allowed_file(file.filename):
                    # Generate unique filename
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(filepath)
                    photo_filename = unique_filename
            
            # Create new issue
            issue = Issue(
                title=title,
                description=description,
                location_text=location_text,
                latitude=latitude,
                longitude=longitude,
                photo_filename=photo_filename,
                reporter_name=reporter_name,
                reporter_email=reporter_email,
                reporter_phone=reporter_phone,
                category=category,
                priority=priority,
                status='Pending'
            )
            
            db.session.add(issue)
            db.session.commit()
            
            flash('Issue reported successfully!', 'success')
            return redirect(url_for('index'))
            
        except Exception as e:
            app.logger.error(f"Error creating issue: {str(e)}")
            flash('An error occurred while reporting the issue. Please try again.', 'error')
            db.session.rollback()
    
    return render_template('report.html')

@app.route('/issue/<int:issue_id>')
def view_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    return render_template('view_issue.html', issue=issue)

@app.route('/update_status/<int:issue_id>/<new_status>')
def update_status(issue_id, new_status):
    if new_status not in ['Pending', 'In Progress', 'Resolved']:
        flash('Invalid status.', 'error')
        return redirect(url_for('index'))
    
    issue = Issue.query.get_or_404(issue_id)
    issue.status = new_status
    db.session.commit()
    
    flash(f'Issue status updated to {new_status}.', 'success')
    return redirect(url_for('view_issue', issue_id=issue_id))

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(413)
def too_large(e):
    flash('File is too large. Maximum size is 16MB.', 'error')
    return redirect(request.url)
