# Civic Issue Reporter

## Overview

The Civic Issue Reporter is a Flask-based web application designed to help citizens report and track civic issues in their community. The application allows users to submit reports about various municipal problems (roads, utilities, safety concerns, etc.) with location data, photos, and detailed descriptions. It provides a dashboard for viewing and filtering reported issues, along with status tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with a base template pattern for consistent UI
- **UI Framework**: Bootstrap 5 with dark theme for responsive design
- **JavaScript Modules**: Modular approach with separate files for geolocation and photo upload functionality
- **Icons**: Feather Icons for consistent iconography
- **Responsive Design**: Mobile-first approach with specific breakpoints for different screen sizes

### Backend Architecture
- **Web Framework**: Flask with modular structure separating concerns
- **Database ORM**: SQLAlchemy with declarative base for database operations
- **Application Structure**: 
  - `app.py` - Application factory and configuration
  - `models.py` - Database models and business logic
  - `routes.py` - Request handlers and view logic
  - `main.py` - Application entry point
- **File Upload System**: Secure file handling with size limits and type validation
- **Session Management**: Flask sessions with configurable secret key

### Data Storage
- **Primary Database**: SQLite for development with PostgreSQL support via environment configuration
- **File Storage**: Local filesystem for uploaded images with organized directory structure
- **Database Schema**: Single table design with comprehensive issue tracking fields including:
  - Basic issue information (title, description, category)
  - Location data (text description, GPS coordinates)
  - Reporter contact information
  - Status and priority tracking
  - Timestamps for creation and updates

### Features
- **Issue Reporting**: Form-based submission with photo upload and location capture
- **Geolocation Integration**: Browser-based GPS coordinate capture with fallback options
- **Image Upload**: Multi-format support with client-side preview and validation
- **Filtering and Search**: Dynamic filtering by status, category, and text search
- **Status Management**: Issue lifecycle tracking (Pending → In Progress → Resolved)
- **Statistics Dashboard**: Real-time counts and status distribution
- **Mobile Support**: Camera integration for direct photo capture on mobile devices

## External Dependencies

### Frontend Libraries
- **Bootstrap 5**: UI framework and component library via CDN
- **Feather Icons**: Icon library for consistent visual elements

### Backend Dependencies
- **Flask**: Core web framework
- **Flask-SQLAlchemy**: Database ORM and integration
- **Werkzeug**: WSGI utilities and proxy handling

### Browser APIs
- **Geolocation API**: For capturing GPS coordinates
- **Camera API**: For direct photo capture on mobile devices
- **File API**: For image preview and validation

### Infrastructure
- **Environment Configuration**: Support for DATABASE_URL and SESSION_SECRET environment variables
- **Proxy Support**: Werkzeug ProxyFix for deployment behind reverse proxies
- **Upload Directory**: Configurable file storage location