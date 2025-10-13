// Checkout Page JavaScript
// Handles checkout process and payment integration

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    // Check if user is logged in
    if (!RentifyApp.currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Load booking data from URL parameters or localStorage
    loadBookingData();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize payment method switching
    initializePaymentMethods();
    
    // Initialize form validation
    initializeFormValidation();
}

function loadBookingData() {
    // Get booking data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const bookingData = {
        carId: urlParams.get('car_id') || localStorage.getItem('booking_car_id'),
        carTitle: urlParams.get('car_title') || localStorage.getItem('booking_car_title'),
        carImage: urlParams.get('car_image') || localStorage.getItem('booking_car_image'),
        pickupDate: urlParams.get('pickup_date') || localStorage.getItem('booking_pickup_date'),
        returnDate: urlParams.get('return_date') || localStorage.getItem('booking_return_date'),
        totalAmount: urlParams.get('total') || localStorage.getItem('booking_total'),
        basePrice: urlParams.get('base_price') || localStorage.getItem('booking_base_price'),
        discount: urlParams.get('discount') || localStorage.getItem('booking_discount') || 0
    };

    // Populate checkout form with booking data
    populateCheckoutData(bookingData);
}

function populateCheckoutData(data) {
    // Update car details
    if (data.carImage) {
        document.getElementById('checkout-car-image').src = data.carImage;
    }
    if (data.carTitle) {
        document.getElementById('checkout-car-title').textContent = data.carTitle;
    }
    if (data.pickupDate) {
        document.getElementById('checkout-pickup-date').textContent = formatDate(data.pickupDate);
    }
    if (data.returnDate) {
        document.getElementById('checkout-return-date').textContent = formatDate(data.returnDate);
    }
    if (data.basePrice) {
        document.getElementById('checkout-base-price').textContent = `$${parseFloat(data.basePrice).toFixed(2)}`;
    }
    if (data.totalAmount) {
        document.getElementById('checkout-total').innerHTML = `<strong>$${parseFloat(data.totalAmount).toFixed(2)}</strong>`;
        document.getElementById('pay-now-btn').innerHTML = `<i class="fas fa-lock"></i> Pay Now - $${parseFloat(data.totalAmount).toFixed(2)}`;
    }
    if (data.discount && parseFloat(data.discount) > 0) {
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('checkout-discount').textContent = `-$${parseFloat(data.discount).toFixed(2)}`;
    }

    // Populate user data
    if (RentifyApp.currentUser) {
        document.getElementById('full-name').value = RentifyApp.currentUser.name || '';
        document.getElementById('email').value = RentifyApp.currentUser.email || '';
        document.getElementById('phone').value = RentifyApp.currentUser.phone || '';
        document.getElementById('license').value = RentifyApp.currentUser.license_number || '';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function initializeFormHandlers() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCheckoutSubmit();
        });
    }
}

function initializePaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
    const cardDetails = document.getElementById('card-details');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

function initializeFormValidation() {
    // Card number formatting
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Expiry date formatting
    const expiry = document.getElementById('expiry');
    if (expiry) {
        expiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // CVV formatting
    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

async function handleCheckoutSubmit() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate form
    if (!validateCheckoutForm(data)) {
        return;
    }

    // Show payment processing modal
    showPaymentModal();

    try {
        // Simulate payment processing
        await processPayment(data);
        
        // Hide payment modal
        hidePaymentModal();
        
        // Show success modal
        showSuccessModal();
        
    } catch (error) {
        console.error('Payment error:', error);
        hidePaymentModal();
        RentifyApp.showNotification('Payment failed. Please try again.', 'error');
    }
}

function validateCheckoutForm(data) {
    const errors = [];

    // Required fields validation
    if (!data.full_name || data.full_name.trim().length < 2) {
        errors.push('Full name must be at least 2 characters long');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!data.phone || data.phone.trim().length < 10) {
        errors.push('Please enter a valid phone number');
    }

    if (!data.license || data.license.trim().length < 5) {
        errors.push('Please enter a valid driver\'s license number');
    }

    if (!data.terms) {
        errors.push('You must agree to the terms and conditions');
    }

    // Card validation if card payment is selected
    if (data.payment_method === 'card') {
        if (!data.card_number || data.card_number.replace(/\s/g, '').length < 16) {
            errors.push('Please enter a valid card number');
        }

        if (!data.expiry || data.expiry.length < 5) {
            errors.push('Please enter a valid expiry date');
        }

        if (!data.cvv || data.cvv.length < 3) {
            errors.push('Please enter a valid CVV');
        }

        if (!data.card_name || data.card_name.trim().length < 2) {
            errors.push('Please enter the name on card');
        }
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

async function processPayment(data) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // In a real application, this would call a payment gateway API
    // For now, we'll simulate a successful payment
    
    // Create booking record
    const bookingData = {
        car_id: localStorage.getItem('booking_car_id'),
        start_date: localStorage.getItem('booking_pickup_date'),
        end_date: localStorage.getItem('booking_return_date'),
        total_amount: localStorage.getItem('booking_total'),
        payment_method: data.payment_method,
        user_info: {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            license: data.license
        }
    };

    // Store booking data
    localStorage.setItem('current_booking', JSON.stringify(bookingData));
    
    return { success: true, booking_id: 'RNF2024001' };
}

function showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Simulate payment steps
        setTimeout(() => {
            const steps = document.querySelectorAll('.payment-steps .step');
            steps[0].classList.remove('active');
            steps[1].classList.add('active');
        }, 1000);
        
        setTimeout(() => {
            const steps = document.querySelectorAll('.payment-steps .step');
            steps[1].classList.remove('active');
            steps[2].classList.add('active');
        }, 2000);
    }
}

function hidePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Add CSS for checkout page
const checkoutStyles = `
.checkout-section {
    padding: calc(80px + var(--spacing-xxl)) 0 var(--spacing-xxl);
    background: var(--background-color);
    min-height: 100vh;
}

.checkout-header {
    text-align: center;
    margin-bottom: var(--spacing-xxl);
}

.checkout-header h1 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-color);
}

.checkout-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xxl);
    max-width: 1200px;
    margin: 0 auto;
}

.booking-summary-card,
.payment-form-card {
    background: var(--card-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
}

.booking-summary-card h3,
.payment-form-card h3 {
    margin-bottom: var(--spacing-lg);
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.booking-summary-card h3 i,
.payment-form-card h3 i {
    color: var(--primary-color);
}

.car-details {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.car-details .car-image {
    width: 120px;
    height: 80px;
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.car-details .car-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.car-info h4 {
    margin-bottom: var(--spacing-xs);
    color: var(--text-color);
}

.car-info p {
    color: var(--text-light);
    margin-bottom: var(--spacing-sm);
}

.car-features {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.car-features .feature {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.9rem;
    color: var(--text-muted);
}

.car-features .feature i {
    color: var(--primary-color);
}

.booking-dates {
    margin-bottom: var(--spacing-lg);
}

.date-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
}

.date-item i {
    color: var(--primary-color);
    font-size: 1.2rem;
}

.date-item strong {
    color: var(--text-color);
}

.date-item p {
    margin: 0;
    color: var(--text-light);
}

.pricing-breakdown {
    border-top: 1px solid var(--border-color);
    padding-top: var(--spacing-lg);
}

.pricing-breakdown h4 {
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
}

.price-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-xs) 0;
}

.price-item.discount {
    color: var(--accent-color);
}

.price-item.total {
    border-top: 1px solid var(--border-color);
    padding-top: var(--spacing-sm);
    margin-top: var(--spacing-sm);
    font-size: 1.1rem;
}

.form-section {
    margin-bottom: var(--spacing-xl);
}

.form-section h4 {
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--spacing-sm);
}

.payment-methods {
    display: grid;
    gap: var(--spacing-sm);
}

.payment-method {
    cursor: pointer;
}

.payment-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    transition: var(--transition-fast);
}

.payment-method input[type="radio"] {
    display: none;
}

.payment-method input[type="radio"]:checked + .payment-option {
    border-color: var(--primary-color);
    background: rgba(0, 212, 170, 0.1);
}

.payment-option i {
    color: var(--primary-color);
    font-size: 1.2rem;
}

.payment-modal .modal-content {
    max-width: 500px;
    text-align: center;
}

.payment-processing {
    padding: var(--spacing-xl);
}

.payment-icon {
    font-size: 3rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
}

.payment-steps {
    margin-top: var(--spacing-lg);
}

.payment-steps .step {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    color: var(--text-muted);
}

.payment-steps .step.active {
    color: var(--primary-color);
}

.payment-steps .step i {
    width: 20px;
}

.success-modal .modal-content {
    max-width: 500px;
    text-align: center;
}

.success-content {
    padding: var(--spacing-xl);
}

.success-icon {
    font-size: 4rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
}

.booking-details {
    background: var(--surface-color);
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);
    margin: var(--spacing-lg) 0;
}

.booking-details p {
    margin: var(--spacing-xs) 0;
    color: var(--text-light);
}

.success-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .checkout-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
    }
    
    .car-details {
        flex-direction: column;
    }
    
    .car-details .car-image {
        width: 100%;
        height: 150px;
    }
    
    .success-actions {
        flex-direction: column;
    }
}
`;

// Inject checkout styles
const styleSheet = document.createElement('style');
styleSheet.textContent = checkoutStyles;
document.head.appendChild(styleSheet);