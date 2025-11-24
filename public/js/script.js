// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const imageName = document.getElementById('imageName');
const imageSize = document.getElementById('imageSize');
const controlsSection = document.getElementById('controlsSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');

// Control elements
const formatSelect = document.getElementById('formatSelect');
const widthInput = document.getElementById('widthInput');
const widthSlider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');
const resetWidthBtn = document.getElementById('resetWidth');
const qualityInput = document.getElementById('qualityInput');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const qualityPercent = document.querySelector('.quality-percent');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link')

// nav toggle
navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('active');

    const spans = navToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(9px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-9px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offset = 80;
            const targetPosition = targetSection.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        }
    });
});
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
});

// State
let currentFile = null;
let originalWidth = null;

// Initialize
init();

function init() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Width controls
    widthInput.addEventListener('input', handleWidthInput);
    widthSlider.addEventListener('input', handleWidthSlider);
    resetWidthBtn.addEventListener('click', resetWidth);
    
    // Quality controls
    qualityInput.addEventListener('input', handleQualityInput);
    qualitySlider.addEventListener('input', handleQualitySlider);
    
    // Buttons
    convertBtn.addEventListener('click', handleConvert);
    resetBtn.addEventListener('click', handleReset);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    } else {
        showError('Please select a valid image file.');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    } else {
        showError('Please drop a valid image file.');
    }
}

function processFile(file) {
    currentFile = file;
    hideError();
    
    // Display file info
    imageName.textContent = file.name;
    imageSize.textContent = formatFileSize(file.size);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.onload = () => {
            originalWidth = previewImage.naturalWidth;
            widthInput.placeholder = originalWidth.toString();
            widthSlider.max = Math.max(4000, originalWidth * 2);
            widthSlider.value = Math.min(800, originalWidth);
            widthInput.value = widthSlider.value;
            updateWidthValue();
            
            previewSection.style.display = 'block';
            controlsSection.style.display = 'block';
            
            // Scroll to controls
            setTimeout(() => {
                controlsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        };
    };
    reader.readAsDataURL(file);
}

function handleWidthInput(e) {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
        widthSlider.value = Math.min(value, widthSlider.max);
        updateWidthValue();
    }
}

function handleWidthSlider(e) {
    widthInput.value = e.target.value;
    updateWidthValue();
}

function updateWidthValue() {
    const value = widthSlider.value;
    widthValue.textContent = `${value}px`;
}

function resetWidth() {
    if (originalWidth) {
        widthSlider.value = originalWidth;
        widthInput.value = originalWidth;
        updateWidthValue();
    }
}

function handleQualityInput(e) {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 1) {
        qualitySlider.value = value;
        updateQualityValue();
    }
}

function handleQualitySlider(e) {
    const value = parseFloat(e.target.value);
    qualityInput.value = value.toFixed(2);
    updateQualityValue();
}

function updateQualityValue() {
    const value = parseFloat(qualitySlider.value);
    const percent = Math.round(value * 100);
    qualityValue.textContent = `${percent}%`;
    qualityPercent.textContent = `${percent}%`;
}

async function handleConvert() {
    if (!currentFile) {
        showError('Please select an image first.');
        return;
    }
    
    const width = widthInput.value ? parseInt(widthInput.value) : null;
    const quality = parseFloat(qualitySlider.value);
    const format = formatSelect.value;
    
    // Validation
    if (width && (isNaN(width) || width < 1)) {
        showError('Width must be a positive number.');
        return;
    }
    
    if (isNaN(quality) || quality < 0.1 || quality > 1) {
        showError('Quality must be between 0.1 and 1.');
        return;
    }
    
    // Show loading
    loadingSection.style.display = 'block';
    controlsSection.style.display = 'none';
    hideError();
    convertBtn.disabled = true;
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('image', currentFile);
        formData.append('width', width || '');
        formData.append('quality', quality);
        formData.append('format', format);
        
        // Send request
        const response = await fetch('/api/images/processed', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to process image. Please try again.');
        }
        
        // Get blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Success feedback
        showSuccess();
        
    } catch (error) {
        console.error('Conversion error:', error);
        showError(error.message || 'An error occurred while processing your image.');
    } finally {
        loadingSection.style.display = 'none';
        controlsSection.style.display = 'block';
        convertBtn.disabled = false;
    }
}

function handleReset() {
    currentFile = null;
    originalWidth = null;
    fileInput.value = '';
    previewImage.src = '';
    previewSection.style.display = 'none';
    controlsSection.style.display = 'none';
    loadingSection.style.display = 'none';
    hideError();
    
    // Reset controls
    formatSelect.value = 'jpeg';
    widthInput.value = '';
    widthSlider.value = 800;
    qualityInput.value = 0.9;
    qualitySlider.value = 0.9;
    updateWidthValue();
    updateQualityValue();
}

function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
    errorSection.style.display = 'none';
}

function showSuccess() {
    // Create temporary success message
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    successMsg.textContent = 'Image converted successfully!';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 300);
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Add CSS animations for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

