// Contact Page JavaScript
// Handles contact form and FAQ functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    initializeContactForm();
    initializeFAQ();
    initializeMap();
}

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmit();
        });
    }
}

async function handleContactSubmit() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateContactForm(data)) {
        return;
    }
    
    try {
        RentifyApp.showLoading();
        
        // Simulate form submission (in a real app, this would send to backend)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        RentifyApp.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Error sending message:', error);
        RentifyApp.showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.subject || data.subject.trim().length < 5) {
        errors.push('Subject must be at least 5 characters long');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    if (errors.length > 0) {
        RentifyApp.showNotification(errors.join('. '), 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                toggleFAQItem(item);
            });
        }
    });
}

function toggleFAQItem(item) {
    const isActive = item.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(faqItem => {
        faqItem.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        item.classList.add('active');
    }
}

function initializeMap() {
    // This would initialize a real map (Google Maps, Leaflet, etc.)
    // For now, we'll just add a click handler to the placeholder
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.addEventListener('click', function() {
            RentifyApp.showNotification('Interactive map coming soon!', 'info');
        });
    }
}