// Photo upload and camera functionality
class PhotoUpload {
    constructor() {
        this.fileInput = document.getElementById('photo');
        this.previewDiv = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.removeBtn = document.getElementById('removeImageBtn');
        this.takePictureBtn = document.getElementById('takePictureBtn');
        
        this.init();
    }

    init() {
        if (!this.fileInput) return;

        // File input change handler
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Remove image button
        if (this.removeBtn) {
            this.removeBtn.addEventListener('click', () => this.removeImage());
        }

        // Take picture button (mobile)
        if (this.takePictureBtn) {
            this.takePictureBtn.addEventListener('click', () => this.takePicture());
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            this.hidePreview();
            return;
        }

        // Validate file type
        if (!this.isValidFileType(file)) {
            this.showError('Please select a valid image file (PNG, JPG, JPEG, GIF, WebP).');
            this.clearFileInput();
            return;
        }

        // Validate file size (16MB limit)
        const maxSize = 16 * 1024 * 1024; // 16MB in bytes
        if (file.size > maxSize) {
            this.showError('File size too large. Please select an image smaller than 16MB.');
            this.clearFileInput();
            return;
        }

        // Show preview
        this.showPreview(file);
    }

    isValidFileType(file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        return allowedTypes.includes(file.type.toLowerCase());
    }

    showPreview(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            if (this.previewImg) {
                this.previewImg.src = e.target.result;
            }
            if (this.previewDiv) {
                this.previewDiv.classList.remove('d-none');
            }
        };

        reader.readAsDataURL(file);
    }

    hidePreview() {
        if (this.previewDiv) {
            this.previewDiv.classList.add('d-none');
        }
        if (this.previewImg) {
            this.previewImg.src = '';
        }
    }

    removeImage() {
        this.clearFileInput();
        this.hidePreview();
    }

    clearFileInput() {
        if (this.fileInput) {
            this.fileInput.value = '';
        }
    }

    takePicture() {
        // For mobile devices, we'll trigger the file input with camera preference
        if (this.fileInput) {
            // Set the accept attribute to prefer camera
            this.fileInput.setAttribute('capture', 'environment');
            this.fileInput.click();
        }
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('photoError');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'photoError';
            errorDiv.className = 'alert alert-danger mt-2';
            
            // Insert after the file input
            this.fileInput.parentNode.appendChild(errorDiv);
        }

        errorDiv.innerHTML = `
            <i data-feather="alert-circle" class="me-2"></i>
            ${message}
        `;

        // Re-initialize feather icons
        feather.replace();

        // Clear error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize photo upload when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoUpload();
});

// Additional utility functions for image handling
class ImageUtils {
    static compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    static getImageOrientation(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const view = new DataView(e.target.result);
                
                if (view.getUint16(0, false) !== 0xFFD8) {
                    resolve(1); // Not a JPEG
                    return;
                }

                const length = view.byteLength;
                let offset = 2;

                while (offset < length) {
                    const marker = view.getUint16(offset, false);
                    offset += 2;

                    if (marker === 0xFFE1) {
                        const little = view.getUint16(offset + 4, false) === 0x4949;
                        offset += view.getUint16(offset, false);
                        const tags = view.getUint16(offset, little);
                        offset += 2;

                        for (let i = 0; i < tags; i++) {
                            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                                resolve(view.getUint16(offset + (i * 12) + 8, little));
                                return;
                            }
                        }
                    } else if ((marker & 0xFF00) !== 0xFF00) {
                        break;
                    } else {
                        offset += view.getUint16(offset, false);
                    }
                }
                
                resolve(1);
            };

            reader.readAsArrayBuffer(file);
        });
    }
}
