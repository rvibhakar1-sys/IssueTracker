from app import db
from datetime import datetime
from sqlalchemy import func

class Issue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location_text = db.Column(db.String(500))  # Human readable location
    latitude = db.Column(db.Float)  # GPS coordinates
    longitude = db.Column(db.Float)
    photo_filename = db.Column(db.String(255))  # Uploaded photo filename
    status = db.Column(db.String(20), default='Pending')  # Pending, In Progress, Resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reporter_name = db.Column(db.String(100))
    reporter_email = db.Column(db.String(120))
    reporter_phone = db.Column(db.String(20))
    category = db.Column(db.String(50))  # Road, Utilities, Safety, Environment, etc.
    priority = db.Column(db.String(20), default='Medium')  # Low, Medium, High, Critical
    
    def __repr__(self):
        return f'<Issue {self.title}>'
    
    @property
    def status_badge_class(self):
        """Returns Bootstrap badge class for status"""
        status_classes = {
            'Pending': 'bg-warning text-dark',
            'In Progress': 'bg-info',
            'Resolved': 'bg-success'
        }
        return status_classes.get(self.status, 'bg-secondary')
    
    @property
    def priority_badge_class(self):
        """Returns Bootstrap badge class for priority"""
        priority_classes = {
            'Low': 'bg-success',
            'Medium': 'bg-warning text-dark',
            'High': 'bg-danger',
            'Critical': 'bg-dark'
        }
        return priority_classes.get(self.priority, 'bg-secondary')
    
    @staticmethod
    def get_status_counts():
        """Returns count of issues by status"""
        return {
            'total': Issue.query.count(),
            'pending': Issue.query.filter_by(status='Pending').count(),
            'in_progress': Issue.query.filter_by(status='In Progress').count(),
            'resolved': Issue.query.filter_by(status='Resolved').count()
        }
