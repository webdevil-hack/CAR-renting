// Rentify - Main JavaScript Application
// Modern car rental platform with full functionality

// Global Variables
let currentUser = null;
let authToken = null;
const API_BASE_URL = '../backend/api';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
    
    // Initialize preloader
    initializePreloader();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize authentication
    initializeAuth();
    
    // Initialize modals
    initializeModals();
    
    // Initialize forms
    initializeForms();
    
    // Initialize animations
    initializeAnimations();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize page-specific functionality
    initializePageSpecific();
}

// Initialize Preloader
function initializePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }
}

// Initialize Navigation
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.classList.remove('active');
            }
        });
    });
}

// Initialize Authentication
function initializeAuth() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const modalClose = document.getElementById('modal-close');
    
    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showAuthModal('login');
        });
    }
    
    // Register button
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            showAuthModal('register');
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Auth switch button
    if (authSwitchBtn) {
        authSwitchBtn.addEventListener('click', function() {
            toggleAuthMode();
        });
    }
    
    // Modal close
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            hideAuthModal();
        });
    }
    
    // Auth form submission
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAuthSubmit();
        });
    }
    
    // Close modal when clicking outside
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
}

// Initialize Modals
function initializeModals() {
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }
    });
}

// Initialize Forms
function initializeForms() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmit();
        });
    }
    
    // Hero search form
    const heroSearchForm = document.getElementById('hero-search-form');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleHeroSearch();
        });
    }
}

// Initialize Animations
function initializeAnimations() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // FAQ accordion
    initializeFAQ();
    
    // Counter animations
    initializeCounters();
}

// Initialize FAQ
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                // Close other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// Initialize Counters
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Animate Counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Initialize Page Specific
function initializePageSpecific() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            initializeHomePage();
            break;
        case 'cars.html':
            initializeCarsPage();
            break;
        case 'car.html':
            initializeCarDetailsPage();
            break;
        case 'dashboard.html':
            initializeDashboardPage();
            break;
        case 'owner.html':
            initializeOwnerPage();
            break;
        case 'admin.html':
            initializeAdminPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
    }
}

// Initialize Home Page
function initializeHomePage() {
    loadFeaturedCars();
    initializeTestimonialsSlider();
}

// Initialize Cars Page
function initializeCarsPage() {
    loadCars();
    initializeFilters();
    initializePagination();
}

// Initialize Car Details Page
function initializeCarDetailsPage() {
    const carId = getUrlParameter('id');
    if (carId) {
        loadCarDetails(carId);
        loadSimilarCars(carId);
    }
    initializeBookingForm();
    initializeImageGallery();
}

// Initialize Dashboard Page
function initializeDashboardPage() {
    loadDashboardData();
    initializeDashboardNavigation();
}

// Initialize Owner Page
function initializeOwnerPage() {
    loadOwnerDashboard();
    initializeOwnerNavigation();
}

// Initialize Admin Page
function initializeAdminPage() {
    loadAdminDashboard();
    initializeAdminNavigation();
}

// Initialize Contact Page
function initializeContactPage() {
    // Contact page specific initialization
}

// Authentication Functions
function showAuthModal(mode) {
    const modal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('modal-title');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const nameGroup = document.getElementById('name-group');
    const phoneGroup = document.getElementById('phone-group');
    const licenseGroup = document.getElementById('license-group');
    const roleGroup = document.getElementById('role-group');
    const rememberGroup = document.getElementById('remember-group');
    
    if (mode === 'login') {
        modalTitle.textContent = 'Login';
        authSubmit.textContent = 'Login';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchBtn.textContent = 'Register here';
        nameGroup.style.display = 'none';
        phoneGroup.style.display = 'none';
        licenseGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        rememberGroup.style.display = 'block';
    } else {
        modalTitle.textContent = 'Register';
        authSubmit.textContent = 'Register';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchBtn.textContent = 'Login here';
        nameGroup.style.display = 'block';
        phoneGroup.style.display = 'block';
        licenseGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        rememberGroup.style.display = 'block';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('auth-form');
    if (form) {
        form.reset();
    }
}

function toggleAuthMode() {
    const modalTitle = document.getElementById('modal-title');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const nameGroup = document.getElementById('name-group');
    const phoneGroup = document.getElementById('phone-group');
    const licenseGroup = document.getElementById('license-group');
    const roleGroup = document.getElementById('role-group');
    
    if (modalTitle.textContent === 'Login') {
        showAuthModal('register');
    } else {
        showAuthModal('login');
    }
}

async function handleAuthSubmit() {
    const form = document.getElementById('auth-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const isLogin = document.getElementById('modal-title').textContent === 'Login';
    
    // Validate form data
    if (!validateAuthForm(data, isLogin)) {
        return;
    }
    
    try {
        showLoading();
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful authentication
        const mockUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || 'Demo User',
            email: data.email,
            role: data.role || 'customer',
            phone: data.phone || '',
            license_number: data.license_number || '',
            token: 'mock_token_' + Date.now()
        };
        
        // Store user data and token
        currentUser = mockUser;
        authToken = mockUser.token;
        
        // Store in localStorage if remember me is checked
        if (data.remember_me) {
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(currentUser));
        }
        
        // Update UI
        updateAuthUI();
        hideAuthModal();
        
        // Show success message
        showNotification('Welcome to Rentify!', 'success');
        
        // Redirect based on role
        redirectBasedOnRole(mockUser.role);
        
    } catch (error) {
        console.error('Auth error:', error);
        showNotification('Authentication failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function validateAuthForm(data, isLogin) {
    const errors = [];
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    if (!isLogin) {
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!data.phone || data.phone.trim().length < 10) {
            errors.push('Please enter a valid phone number');
        }
        
        if (!data.license_number || data.license_number.trim().length < 5) {
            errors.push('Please enter a valid driver\'s license number');
        }
        
        if (!data.role) {
            errors.push('Please select your role');
        }
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('. '), 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

function checkAuthStatus() {
    const storedToken = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (storedToken && storedUserData) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUserData);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = currentUser.name;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function redirectBasedOnRole(role) {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        return; // Stay on home page
    }
    
    switch (role) {
        case 'customer':
            window.location.href = 'dashboard.html';
            break;
        case 'owner':
            window.location.href = 'owner.html';
            break;
        case 'admin':
            window.location.href = 'admin.html';
            break;
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Car Functions
async function loadFeaturedCars() {
    try {
        const response = await apiCall('cars.php?limit=6');
        if (response.success) {
            displayCars(response.data.cars, 'featured-cars');
        }
    } catch (error) {
        console.error('Error loading featured cars:', error);
    }
}

async function loadCars(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters);
        const response = await apiCall(`cars.php?${queryParams}`);
        if (response.success) {
            displayCars(response.data.cars, 'cars-grid');
            updateCarsCount(response.data.pagination.total_cars);
            updatePagination(response.data.pagination);
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        showNotification('Failed to load cars', 'error');
    }
}

async function loadCarDetails(carId) {
    try {
        const response = await apiCall(`car.php?id=${carId}`);
        if (response.success) {
            displayCarDetails(response.data);
        }
    } catch (error) {
        console.error('Error loading car details:', error);
        showNotification('Failed to load car details', 'error');
    }
}

async function loadSimilarCars(carId) {
    try {
        const response = await apiCall('cars.php?limit=4');
        if (response.success) {
            displayCars(response.data.cars, 'similar-cars');
        }
    } catch (error) {
        console.error('Error loading similar cars:', error);
    }
}

function displayCars(cars, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (cars.length === 0) {
        container.innerHTML = '<p class="text-center">No cars found</p>';
        return;
    }
    
    const carsHTML = cars.map(car => `
        <div class="car-card" data-aos="fade-up">
            <div class="car-image">
                <img src="${car.images && car.images.length > 0 ? car.images[0] : 'images/placeholder-car.jpg'}" alt="${car.title}">
                <div class="car-overlay">
                    <button class="btn btn-primary" onclick="viewCarDetails(${car.id})">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                </div>
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.title}</h3>
                <div class="car-specs">
                    <div class="spec-item">
                        <i class="fas fa-users"></i>
                        <span>${car.seats} seats</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-gas-pump"></i>
                        <span>${car.fuel_type}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-cog"></i>
                        <span>${car.transmission}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${car.city}</span>
                    </div>
                </div>
                <div class="car-price">
                    <span class="price-amount">$${car.price_per_day}</span>
                    <span class="price-period">per day</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = carsHTML;
}

function displayCarDetails(car) {
    // Update car title
    const carTitle = document.getElementById('car-title');
    if (carTitle) carTitle.textContent = car.title;
    
    // Update car price
    const carPrice = document.getElementById('car-price');
    if (carPrice) carPrice.textContent = `$${car.price_per_day}`;
    
    // Update car specs
    const specs = {
        'car-year': car.year,
        'car-seats': `${car.seats} seats`,
        'car-fuel': car.fuel_type,
        'car-transmission': car.transmission,
        'car-mileage': car.mileage || 'N/A',
        'car-location': car.city
    };
    
    Object.entries(specs).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Update car description
    const carDescription = document.getElementById('car-description');
    if (carDescription) carDescription.textContent = car.description || 'No description available';
    
    // Update owner info
    const ownerName = document.getElementById('owner-name');
    const ownerPhone = document.getElementById('owner-phone');
    if (ownerName) ownerName.textContent = car.owner_name;
    if (ownerPhone) ownerPhone.textContent = `Phone: ${car.owner_phone}`;
    
    // Update images
    updateCarImages(car.images || []);
    
    // Update rating
    updateCarRating(car.average_rating, car.total_reviews);
}

function updateCarImages(images) {
    const mainImage = document.getElementById('main-car-image');
    const thumbnailsContainer = document.getElementById('image-thumbnails');
    
    if (images.length > 0) {
        if (mainImage) {
            mainImage.src = images[0];
            mainImage.alt = 'Car Image';
        }
        
        if (thumbnailsContainer) {
            const thumbnailsHTML = images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${image}', this)">
                    <img src="${image}" alt="Car Image">
                </div>
            `).join('');
            thumbnailsContainer.innerHTML = thumbnailsHTML;
        }
    }
}

function updateCarRating(rating, totalReviews) {
    const ratingContainer = document.getElementById('car-rating');
    if (!ratingContainer) return;
    
    const starsHTML = Array.from({ length: 5 }, (_, i) => `
        <i class="fas fa-star ${i < Math.floor(rating) ? 'active' : ''}"></i>
    `).join('');
    
    ratingContainer.innerHTML = `
        <div class="stars">
            ${starsHTML}
        </div>
        <span>${rating.toFixed(1)} (${totalReviews} reviews)</span>
    `;
}

function changeMainImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('main-car-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

// Navigation Functions
function viewCarDetails(carId) {
    window.location.href = `car.html?id=${carId}`;
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Filter Functions
function initializeFilters() {
    const filterElements = document.querySelectorAll('#filter-brand, #filter-type, #filter-fuel, #filter-transmission, #min-price, #max-price, #sort-by');
    
    filterElements.forEach(element => {
        element.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearFilters();
        });
    }
}

function applyFilters() {
    const filters = {
        brand: document.getElementById('filter-brand')?.value || '',
        type: document.getElementById('filter-type')?.value || '',
        fuel_type: document.getElementById('filter-fuel')?.value || '',
        transmission: document.getElementById('filter-transmission')?.value || '',
        min_price: document.getElementById('min-price')?.value || '',
        max_price: document.getElementById('max-price')?.value || '',
        sort: document.getElementById('sort-by')?.value || '',
        page: 1
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) {
            delete filters[key];
        }
    });
    
    loadCars(filters);
}

function clearFilters() {
    document.getElementById('filter-brand').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-fuel').value = '';
    document.getElementById('filter-transmission').value = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.getElementById('sort-by').value = 'newest';
    
    loadCars();
}

// Pagination Functions
function initializePagination() {
    // Pagination will be handled by the loadCars function
}

function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    const { current_page, total_pages } = pagination;
    
    if (total_pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Previous button
    if (current_page > 1) {
        paginationHTML += `<button class="btn btn-outline" onclick="goToPage(${current_page - 1})">Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(total_pages, current_page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === current_page ? 'btn-primary' : 'btn-outline';
        paginationHTML += `<button class="btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    // Next button
    if (current_page < total_pages) {
        paginationHTML += `<button class="btn btn-outline" onclick="goToPage(${current_page + 1})">Next</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

function goToPage(page) {
    const currentFilters = getCurrentFilters();
    currentFilters.page = page;
    loadCars(currentFilters);
}

function getCurrentFilters() {
    return {
        brand: document.getElementById('filter-brand')?.value || '',
        type: document.getElementById('filter-type')?.value || '',
        fuel_type: document.getElementById('filter-fuel')?.value || '',
        transmission: document.getElementById('filter-transmission')?.value || '',
        min_price: document.getElementById('min-price')?.value || '',
        max_price: document.getElementById('max-price')?.value || '',
        sort: document.getElementById('sort-by')?.value || ''
    };
}

// Booking Functions
function initializeBookingForm() {
    const bookNowBtn = document.getElementById('book-now-btn');
    const bookingForm = document.getElementById('booking-form');
    const closeBookingForm = document.getElementById('close-booking-form');
    
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            if (!currentUser) {
                showAuthModal('login');
                return;
            }
            showBookingForm();
        });
    }
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookingSubmit();
        });
    }
    
    if (closeBookingForm) {
        closeBookingForm.addEventListener('click', function() {
            hideBookingForm();
        });
    }
    
    // Date change handlers
    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    
    if (pickupDate && returnDate) {
        pickupDate.addEventListener('change', updateBookingSummary);
        returnDate.addEventListener('change', updateBookingSummary);
    }
    
    // Coupon handler
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            applyCoupon();
        });
    }
}

function showBookingForm() {
    const bookingSection = document.getElementById('booking-form-section');
    if (bookingSection) {
        bookingSection.style.display = 'block';
        document.body.style.overflow = 'hidden';
        updateBookingSummary();
    }
}

function hideBookingForm() {
    const bookingSection = document.getElementById('booking-form-section');
    if (bookingSection) {
        bookingSection.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function updateBookingSummary() {
    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    const pricePerDay = document.querySelector('.price-amount')?.textContent.replace('$', '') || '0';
    
    if (pickupDate && returnDate && pickupDate.value && returnDate.value) {
        const start = new Date(pickupDate.value);
        const end = new Date(returnDate.value);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const total = parseFloat(pricePerDay) * days;
        
        document.getElementById('summary-price-per-day').textContent = `$${pricePerDay}`;
        document.getElementById('summary-days').textContent = days;
        document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
    }
}

async function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value;
    if (!couponCode) return;
    
    try {
        const response = await apiCall(`coupons.php?code=${couponCode}`);
        if (response.success) {
            const coupon = response.data;
            const total = parseFloat(document.getElementById('summary-total').textContent.replace('$', ''));
            
            let discount = 0;
            if (coupon.discount_type === 'percentage') {
                discount = (total * coupon.discount_value) / 100;
                if (coupon.max_discount) {
                    discount = Math.min(discount, coupon.max_discount);
                }
            } else {
                discount = coupon.discount_value;
            }
            
            const finalTotal = total - discount;
            
            document.getElementById('summary-discount').textContent = `-$${discount.toFixed(2)}`;
            document.getElementById('summary-total').textContent = `$${finalTotal.toFixed(2)}`;
            document.getElementById('discount-item').style.display = 'flex';
            
            showNotification('Coupon applied successfully!', 'success');
        } else {
            showNotification('Invalid coupon code', 'error');
        }
    } catch (error) {
        showNotification('Failed to apply coupon', 'error');
    }
}

async function handleBookingSubmit() {
    const form = document.getElementById('booking-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const carId = getUrlParameter('id');
    if (!carId) {
        showNotification('Car ID not found', 'error');
        return;
    }
    
    data.car_id = carId;
    
    try {
        showLoading();
        
        const response = await apiCall('bookings.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            showNotification('Booking created successfully!', 'success');
            hideBookingForm();
            
            // Redirect to payment or dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showNotification(response.message || 'Booking failed', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Failed to create booking', 'error');
    } finally {
        hideLoading();
    }
}

// Image Gallery Functions
function initializeImageGallery() {
    const viewGalleryBtn = document.getElementById('view-gallery-btn');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryClose = document.getElementById('gallery-close');
    
    if (viewGalleryBtn) {
        viewGalleryBtn.addEventListener('click', function() {
            showImageGallery();
        });
    }
    
    if (galleryClose) {
        galleryClose.addEventListener('click', function() {
            hideImageGallery();
        });
    }
}

function showImageGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideImageGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Contact Functions
async function handleContactSubmit() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate form submission
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        form.reset();
    }, 2000);
}

// Hero Search Functions
function handleHeroSearch() {
    const location = document.getElementById('search-location').value;
    const pickup = document.getElementById('search-pickup').value;
    const returnDate = document.getElementById('search-return').value;
    
    const params = new URLSearchParams();
    if (location) params.append('city', location);
    if (pickup) params.append('start_date', pickup);
    if (returnDate) params.append('end_date', returnDate);
    
    window.location.href = `cars.html?${params.toString()}`;
}

// Testimonials Slider
function initializeTestimonialsSlider() {
    // Simple testimonials display - can be enhanced with actual slider functionality
    const testimonials = document.querySelectorAll('.testimonial');
    let currentIndex = 0;
    
    setInterval(() => {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.opacity = index === currentIndex ? '1' : '0.7';
        });
        
        currentIndex = (currentIndex + 1) % testimonials.length;
    }, 5000);
}

// Utility Functions
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00B894' : type === 'error' ? '#e74c3c' : '#0984E3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        document.body.removeChild(loading);
    }
}

function updateCarsCount(count) {
    const countElement = document.getElementById('cars-count');
    if (countElement) {
        countElement.textContent = `${count} cars found`;
    }
}

// Dashboard Functions (placeholder)
function loadDashboardData() {
    // Dashboard specific loading will be handled in dashboard.js
}

function initializeDashboardNavigation() {
    // Dashboard navigation will be handled in dashboard.js
}

function loadOwnerDashboard() {
    // Owner dashboard loading will be handled in owner.js
}

function initializeOwnerNavigation() {
    // Owner navigation will be handled in owner.js
}

function loadAdminDashboard() {
    // Admin dashboard loading will be handled in admin.js
}

function initializeAdminNavigation() {
    // Admin navigation will be handled in admin.js
}

// Export functions for use in other files
window.RentifyApp = {
    apiCall,
    showNotification,
    showLoading,
    hideLoading,
    currentUser,
    authToken
};