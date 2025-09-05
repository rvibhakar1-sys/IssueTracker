// Geolocation functionality
class LocationCapture {
    constructor() {
        this.init();
    }

    init() {
        const getLocationBtn = document.getElementById('getLocationBtn');
        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', () => this.getCurrentLocation());
        }
        
        // Automatically get location when page loads
        this.autoGetLocation();
    }

    autoGetLocation() {
        // Only auto-get location on the report page
        if (window.location.pathname === '/report') {
            // Small delay to ensure UI is ready
            setTimeout(() => {
                this.getCurrentLocation(true); // Pass true for auto mode
            }, 1000);
        }
    }

    getCurrentLocation(autoMode = false) {
        const statusDiv = document.getElementById('locationStatus');
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');
        const getLocationBtn = document.getElementById('getLocationBtn');

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            this.showStatus('error', 'Geolocation is not supported by this browser.');
            return;
        }

        // Show loading state
        if (getLocationBtn && !autoMode) {
            getLocationBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Getting location...';
            getLocationBtn.disabled = true;
        }
        
        // Different messages for auto vs manual mode
        const message = autoMode ? 'Automatically detecting your location...' : 'Requesting location access...';
        this.showStatus('info', message);

        // Get current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Update form fields
                latInput.value = lat.toFixed(6);
                lngInput.value = lng.toFixed(6);

                // Show success message
                const successMessage = autoMode ? 
                    `Location detected automatically! Accuracy: ${Math.round(accuracy)} meters` :
                    `Location captured successfully! Accuracy: ${Math.round(accuracy)} meters`;
                this.showStatus('success', successMessage);

                // Try to get address from coordinates (reverse geocoding)
                this.reverseGeocode(lat, lng);

                // Reset button only if not in auto mode
                if (getLocationBtn && !autoMode) {
                    getLocationBtn.innerHTML = '<i data-feather="check-circle" class="me-1"></i>Location Captured';
                    getLocationBtn.classList.remove('btn-outline-primary');
                    getLocationBtn.classList.add('btn-outline-success');
                    
                    // Re-initialize feather icons
                    feather.replace();
                } else if (autoMode && getLocationBtn) {
                    // In auto mode, update button to show success
                    getLocationBtn.innerHTML = '<i data-feather="check-circle" class="me-1"></i>Auto Location Set';
                    getLocationBtn.classList.remove('btn-outline-primary');
                    getLocationBtn.classList.add('btn-outline-success');
                    getLocationBtn.disabled = false;
                    
                    // Re-initialize feather icons
                    feather.replace();
                }
            },
            (error) => {
                let errorMessage = 'Unable to get location. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access was denied by user.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }

                // Only show error if not in auto mode, or if it's a permission denied error
                if (!autoMode || error.code === error.PERMISSION_DENIED) {
                    this.showStatus('error', errorMessage);
                }

                // Reset button
                if (getLocationBtn && !autoMode) {
                    getLocationBtn.innerHTML = '<i data-feather="crosshair" class="me-1"></i>Try Again';
                    getLocationBtn.disabled = false;
                    
                    // Re-initialize feather icons
                    feather.replace();
                } else if (autoMode && getLocationBtn) {
                    // In auto mode, keep button functional for manual retry
                    getLocationBtn.innerHTML = '<i data-feather="crosshair" class="me-1"></i>Get My Location';
                    getLocationBtn.disabled = false;
                    
                    // Re-initialize feather icons
                    feather.replace();
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    reverseGeocode(lat, lng) {
        // Simple reverse geocoding using a free service
        // Note: In production, you might want to use a more reliable service
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    const locationInput = document.getElementById('location_text');
                    if (locationInput && !locationInput.value.trim()) {
                        // Only set if user hasn't already entered a location
                        locationInput.value = this.formatAddress(data);
                    }
                }
            })
            .catch(error => {
                console.log('Reverse geocoding failed:', error);
                // Silently fail - not critical functionality
            });
    }

    formatAddress(data) {
        const address = data.address;
        let formatted = '';

        // Build a readable address
        if (address) {
            const parts = [];
            
            if (address.house_number && address.road) {
                parts.push(`${address.house_number} ${address.road}`);
            } else if (address.road) {
                parts.push(address.road);
            }
            
            if (address.neighbourhood || address.suburb) {
                parts.push(address.neighbourhood || address.suburb);
            }
            
            if (address.city || address.town || address.village) {
                parts.push(address.city || address.town || address.village);
            }
            
            formatted = parts.join(', ');
        }

        return formatted || data.display_name;
    }

    showStatus(type, message) {
        const statusDiv = document.getElementById('locationStatus');
        if (!statusDiv) return;

        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';

        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'alert-circle' : 'info';

        statusDiv.innerHTML = `
            <div class="alert ${alertClass} d-flex align-items-center" role="alert">
                <i data-feather="${icon}" class="me-2"></i>
                <div>${message}</div>
            </div>
        `;

        // Re-initialize feather icons
        feather.replace();

        // Clear status after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        }
    }
}

// Initialize location capture when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LocationCapture();
});
