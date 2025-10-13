// Car Details Page JavaScript
// Handles car details display, booking, and image gallery

document.addEventListener('DOMContentLoaded', function() {
    initializeCarDetailsPage();
});

function initializeCarDetailsPage() {
    const carId = getUrlParameter('id');
    if (carId) {
        loadCarDetails(carId);
        loadSimilarCars(carId);
    } else {
        RentifyApp.showNotification('Car ID not found', 'error');
        window.location.href = 'cars.html';
    }
    
    initializeBookingForm();
    initializeImageGallery();
    initializeWishlistButton();
}

async function loadCarDetails(carId) {
    try {
        RentifyApp.showLoading();
        
        const response = await RentifyApp.apiCall(`car.php?id=${carId}`);
        
        if (response.success) {
            displayCarDetails(response.data);
            loadReviews(response.data.reviews || []);
        } else {
            RentifyApp.showNotification('Car not found', 'error');
            window.location.href = 'cars.html';
        }
    } catch (error) {
        console.error('Error loading car details:', error);
        RentifyApp.showNotification('Failed to load car details', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
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
    
    // Store car data for booking
    window.currentCar = car;
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
    } else {
        // Use placeholder image
        if (mainImage) {
            mainImage.src = 'images/placeholder-car.jpg';
        }
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = '';
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

function loadReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    const reviewsSummary = document.getElementById('reviews-summary');
    
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center">No reviews yet</p>';
        if (reviewsSummary) {
            reviewsSummary.innerHTML = '<p>No reviews available</p>';
        }
        return;
    }
    
    // Calculate average rating
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    // Update summary
    if (reviewsSummary) {
        const starsHTML = Array.from({ length: 5 }, (_, i) => `
            <i class="fas fa-star ${i < Math.floor(avgRating) ? 'active' : ''}"></i>
        `).join('');
        
        reviewsSummary.innerHTML = `
            <div class="rating-summary">
                <div class="stars">${starsHTML}</div>
                <span class="rating-number">${avgRating.toFixed(1)}</span>
                <span class="review-count">(${reviews.length} reviews)</span>
            </div>
        `;
    }
    
    // Display reviews
    const reviewsHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="reviewer-details">
                        <h4>${review.user_name}</h4>
                        <div class="review-rating">
                            ${Array.from({ length: 5 }, (_, i) => `
                                <i class="fas fa-star ${i < review.rating ? 'active' : ''}"></i>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="review-date">
                    ${new Date(review.created_at).toLocaleDateString()}
                </div>
            </div>
            <div class="review-content">
                <p>${review.comment || 'No comment provided'}</p>
            </div>
        </div>
    `).join('');
    
    reviewsList.innerHTML = reviewsHTML;
}

async function loadSimilarCars(carId) {
    try {
        const response = await RentifyApp.apiCall('cars.php?limit=4');
        if (response.success) {
            displaySimilarCars(response.data.cars);
        }
    } catch (error) {
        console.error('Error loading similar cars:', error);
    }
}

function displaySimilarCars(cars) {
    const container = document.getElementById('similar-cars');
    if (!container) return;
    
    if (cars.length === 0) {
        container.innerHTML = '<p class="text-center">No similar cars found</p>';
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

function viewCarDetails(carId) {
    window.location.href = `car.html?id=${carId}`;
}

// Booking Form Functions
function initializeBookingForm() {
    const bookNowBtn = document.getElementById('book-now-btn');
    const bookingForm = document.getElementById('booking-form');
    const closeBookingForm = document.getElementById('close-booking-form');
    
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            if (!RentifyApp.currentUser) {
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
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const pickupDate = document.getElementById('pickup-date');
        const returnDate = document.getElementById('return-date');
        
        if (pickupDate) {
            pickupDate.min = today;
            pickupDate.value = today;
        }
        if (returnDate) {
            returnDate.min = today;
        }
        
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
    const pricePerDay = window.currentCar ? window.currentCar.price_per_day : 0;
    
    if (pickupDate && returnDate && pickupDate.value && returnDate.value) {
        const start = new Date(pickupDate.value);
        const end = new Date(returnDate.value);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const total = pricePerDay * days;
        
        document.getElementById('summary-price-per-day').textContent = `$${pricePerDay}`;
        document.getElementById('summary-days').textContent = days;
        document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
        
        // Reset discount
        document.getElementById('discount-item').style.display = 'none';
        document.getElementById('summary-discount').textContent = '-$0';
    }
}

async function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value;
    if (!couponCode) {
        RentifyApp.showNotification('Please enter a coupon code', 'error');
        return;
    }
    
    try {
        const response = await RentifyApp.apiCall(`coupons.php?code=${couponCode}`);
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
            
            RentifyApp.showNotification('Coupon applied successfully!', 'success');
        } else {
            RentifyApp.showNotification('Invalid coupon code', 'error');
        }
    } catch (error) {
        RentifyApp.showNotification('Failed to apply coupon', 'error');
    }
}

async function handleBookingSubmit() {
    if (!RentifyApp.currentUser) {
        RentifyApp.showNotification('Please login to book a car', 'error');
        return;
    }
    
    const form = document.getElementById('booking-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!window.currentCar) {
        RentifyApp.showNotification('Car information not available', 'error');
        return;
    }
    
    data.car_id = window.currentCar.id;
    
    // Validate dates
    const pickupDate = new Date(data.pickup_date);
    const returnDate = new Date(data.return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
        RentifyApp.showNotification('Pickup date cannot be in the past', 'error');
        return;
    }
    
    if (returnDate <= pickupDate) {
        RentifyApp.showNotification('Return date must be after pickup date', 'error');
        return;
    }
    
    try {
        RentifyApp.showLoading();
        
        const response = await RentifyApp.apiCall('bookings.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            RentifyApp.showNotification('Booking created successfully!', 'success');
            hideBookingForm();
            
            // Redirect to payment or dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            RentifyApp.showNotification(response.message || 'Booking failed', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        RentifyApp.showNotification('Failed to create booking', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

// Image Gallery Functions
function initializeImageGallery() {
    const viewGalleryBtn = document.getElementById('view-gallery-btn');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryClose = document.getElementById('gallery-close');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    
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
    
    if (galleryPrev) {
        galleryPrev.addEventListener('click', function() {
            navigateGallery('prev');
        });
    }
    
    if (galleryNext) {
        galleryNext.addEventListener('click', function() {
            navigateGallery('next');
        });
    }
}

function showImageGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize gallery with current car images
        if (window.currentCar && window.currentCar.images) {
            initializeGalleryImages(window.currentCar.images);
        }
    }
}

function hideImageGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initializeGalleryImages(images) {
    const mainImage = document.getElementById('gallery-main-image');
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    
    if (images.length === 0) return;
    
    // Set main image
    if (mainImage) {
        mainImage.src = images[0];
    }
    
    // Create thumbnails
    if (thumbnailsContainer) {
        const thumbnailsHTML = images.map((image, index) => `
            <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}" onclick="selectGalleryImage(${index})">
                <img src="${image}" alt="Car Image">
            </div>
        `).join('');
        thumbnailsContainer.innerHTML = thumbnailsHTML;
    }
    
    // Store current image index
    window.currentGalleryIndex = 0;
    window.galleryImages = images;
}

function selectGalleryImage(index) {
    if (!window.galleryImages) return;
    
    const mainImage = document.getElementById('gallery-main-image');
    if (mainImage) {
        mainImage.src = window.galleryImages[index];
    }
    
    // Update active thumbnail
    document.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    window.currentGalleryIndex = index;
}

function navigateGallery(direction) {
    if (!window.galleryImages) return;
    
    const totalImages = window.galleryImages.length;
    if (totalImages === 0) return;
    
    if (direction === 'prev') {
        window.currentGalleryIndex = (window.currentGalleryIndex - 1 + totalImages) % totalImages;
    } else {
        window.currentGalleryIndex = (window.currentGalleryIndex + 1) % totalImages;
    }
    
    selectGalleryImage(window.currentGalleryIndex);
}

// Wishlist Functions
function initializeWishlistButton() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            addToWishlist();
        });
    }
}

async function addToWishlist() {
    if (!RentifyApp.currentUser) {
        showAuthModal('login');
        return;
    }
    
    if (!window.currentCar) {
        RentifyApp.showNotification('Car information not available', 'error');
        return;
    }
    
    try {
        // This would be implemented with a wishlist API endpoint
        RentifyApp.showNotification('Added to wishlist!', 'success');
        
        // Update button state
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Added to Wishlist';
            wishlistBtn.disabled = true;
        }
    } catch (error) {
        RentifyApp.showNotification('Failed to add to wishlist', 'error');
    }
}

// Utility Functions
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

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