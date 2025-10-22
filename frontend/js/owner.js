// Owner Dashboard JavaScript
// Handles car owner dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeOwnerDashboard();
});

function initializeOwnerDashboard() {
    // Check authentication and role
    if (!RentifyApp.currentUser || RentifyApp.currentUser.role !== 'owner') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeOwnerNavigation();
    loadOwnerDashboardData();
    initializeAddCarForm();
}

function initializeOwnerNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetElement = document.getElementById(`${targetSection}-section`);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Load section data
            loadOwnerSectionData(targetSection);
        });
    });
}

async function loadOwnerDashboardData() {
    try {
        RentifyApp.showLoading();
        
        // Load owner's cars
        await loadOwnerCars();
        
        // Load owner's bookings
        await loadOwnerBookings();
        
        // Load earnings data
        await loadEarningsData();
        
        // Update dashboard stats
        updateOwnerStats();
        
    } catch (error) {
        console.error('Error loading owner dashboard data:', error);
        RentifyApp.showNotification('Failed to load dashboard data', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

async function loadOwnerCars() {
    try {
        const response = await RentifyApp.apiCall('cars.php');
        if (response.success) {
            const ownerCars = response.data.cars.filter(car => car.owner_id == RentifyApp.currentUser.id);
            displayOwnerCars(ownerCars);
            updateCarsPreview(ownerCars);
        }
    } catch (error) {
        console.error('Error loading owner cars:', error);
    }
}

function displayOwnerCars(cars) {
    const carsGrid = document.getElementById('owner-cars-grid');
    if (!carsGrid) return;
    
    if (cars.length === 0) {
        carsGrid.innerHTML = `
            <div class="no-cars-found">
                <i class="fas fa-car" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No cars listed</h3>
                <p>Start by adding your first car to the platform</p>
                <button class="btn btn-primary" onclick="showAddCarSection()">
                    <i class="fas fa-plus"></i>
                    Add Your First Car
                </button>
            </div>
        `;
        return;
    }
    
    const carsHTML = cars.map(car => `
        <div class="car-card owner-car-card">
            <div class="car-image">
                <img src="${car.images && car.images.length > 0 ? car.images[0] : 'images/placeholder-car.jpg'}" alt="${car.title}">
                <div class="car-overlay">
                    <button class="btn btn-primary" onclick="editCar(${car.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                </div>
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.title}</h3>
                <div class="car-specs">
                    <div class="spec-item">
                        <i class="fas fa-calendar"></i>
                        <span>${car.year}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-users"></i>
                        <span>${car.seats} seats</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-gas-pump"></i>
                        <span>${car.fuel_type}</span>
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
                <div class="car-status">
                    <span class="status-badge ${car.is_available ? 'available' : 'unavailable'}">
                        ${car.is_available ? 'Available' : 'Unavailable'}
                    </span>
                </div>
                <div class="car-actions">
                    <button class="btn btn-outline" onclick="toggleCarAvailability(${car.id}, ${car.is_available})">
                        <i class="fas fa-${car.is_available ? 'pause' : 'play'}"></i>
                        ${car.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteCar(${car.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    carsGrid.innerHTML = carsHTML;
}

function updateCarsPreview(cars) {
    const previewContainer = document.getElementById('cars-preview');
    if (!previewContainer) return;
    
    const previewCars = cars.slice(0, 3);
    if (previewCars.length === 0) {
        previewContainer.innerHTML = '<p>No cars listed yet</p>';
        return;
    }
    
    const previewHTML = previewCars.map(car => `
        <div class="preview-car">
            <img src="${car.images && car.images.length > 0 ? car.images[0] : 'images/placeholder-car.jpg'}" alt="${car.title}">
            <div class="preview-info">
                <h4>${car.title}</h4>
                <p>$${car.price_per_day}/day</p>
            </div>
        </div>
    `).join('');
    
    previewContainer.innerHTML = previewHTML;
}

async function loadOwnerBookings() {
    try {
        const response = await RentifyApp.apiCall('bookings.php');
        if (response.success) {
            // Filter bookings for owner's cars
            const ownerCars = await getOwnerCars();
            const ownerBookings = response.data.filter(booking => 
                ownerCars.some(car => car.id == booking.car_id)
            );
            
            displayOwnerBookings(ownerBookings);
            updateRecentBookings(ownerBookings);
        }
    } catch (error) {
        console.error('Error loading owner bookings:', error);
    }
}

async function getOwnerCars() {
    try {
        const response = await RentifyApp.apiCall('cars.php');
        if (response.success) {
            return response.data.cars.filter(car => car.owner_id == RentifyApp.currentUser.id);
        }
    } catch (error) {
        console.error('Error getting owner cars:', error);
    }
    return [];
}

function displayOwnerBookings(bookings) {
    const bookingsContainer = document.getElementById('owner-bookings');
    if (!bookingsContainer) return;
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML = '<p class="text-center">No bookings yet</p>';
        return;
    }
    
    const bookingsHTML = bookings.map(booking => `
        <div class="booking-item owner-booking">
            <div class="booking-image">
                <img src="${booking.images && booking.images.length > 0 ? booking.images[0] : 'images/placeholder-car.jpg'}" alt="${booking.car_title}">
            </div>
            <div class="booking-details">
                <h4>${booking.car_title}</h4>
                <p class="booking-customer">Customer: ${booking.customer_name || 'Unknown'}</p>
                <div class="booking-dates">
                    <span><i class="fas fa-calendar"></i> ${new Date(booking.start_date).toLocaleDateString()}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
                <div class="booking-amount">
                    <strong>$${booking.total_amount}</strong>
                </div>
            </div>
            <div class="booking-actions">
                <div class="status-badge ${booking.status.toLowerCase()}">
                    ${booking.status}
                </div>
                <div class="booking-controls">
                    ${booking.status === 'pending' ? `
                        <button class="btn btn-primary btn-sm" onclick="updateBookingStatus(${booking.id}, 'confirmed')">
                            <i class="fas fa-check"></i>
                            Confirm
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="updateBookingStatus(${booking.id}, 'cancelled')">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                    ` : ''}
                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-success btn-sm" onclick="updateBookingStatus(${booking.id}, 'completed')">
                            <i class="fas fa-check-double"></i>
                            Complete
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    bookingsContainer.innerHTML = bookingsHTML;
}

function updateRecentBookings(bookings) {
    const recentContainer = document.getElementById('recent-bookings');
    if (!recentContainer) return;
    
    const recentBookings = bookings.slice(0, 3);
    recentContainer.innerHTML = recentBookings.map(booking => createBookingHTML(booking)).join('');
}

function createBookingHTML(booking) {
    return `
        <div class="booking-item">
            <div class="booking-image">
                <img src="${booking.images && booking.images.length > 0 ? booking.images[0] : 'images/placeholder-car.jpg'}" alt="${booking.car_title}">
            </div>
            <div class="booking-details">
                <h4>${booking.car_title}</h4>
                <p>${booking.customer_name || 'Unknown Customer'}</p>
                <div class="booking-dates">
                    <span>${new Date(booking.start_date).toLocaleDateString()}</span>
                    <span>${new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="booking-status">
                <span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span>
                <span class="booking-amount">$${booking.total_amount}</span>
            </div>
        </div>
    `;
}

async function loadEarningsData() {
    try {
        // This would load earnings data from the backend
        // For now, we'll simulate the data
        const earningsData = {
            monthly: 2500,
            yearly: 30000,
            total: 45000
        };
        
        updateEarningsDisplay(earningsData);
    } catch (error) {
        console.error('Error loading earnings data:', error);
    }
}

function updateEarningsDisplay(earnings) {
    const elements = {
        'monthly-earnings': `$${earnings.monthly.toLocaleString()}`,
        'yearly-earnings': `$${earnings.yearly.toLocaleString()}`,
        'total-earnings-amount': `$${earnings.total.toLocaleString()}`
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function updateOwnerStats() {
    // This would calculate and update owner statistics
    // For now, we'll use placeholder values
    const stats = {
        totalCars: 0,
        totalBookings: 0,
        totalEarnings: 0,
        averageRating: 0
    };
    
    document.getElementById('total-cars').textContent = stats.totalCars;
    document.getElementById('total-bookings').textContent = stats.totalBookings;
    document.getElementById('total-earnings').textContent = `$${stats.totalEarnings}`;
    document.getElementById('average-rating').textContent = stats.averageRating.toFixed(1);
}

function loadOwnerSectionData(section) {
    switch (section) {
        case 'cars':
            loadOwnerCars();
            break;
        case 'bookings':
            loadOwnerBookings();
            break;
        case 'earnings':
            loadEarningsData();
            break;
        case 'add-car':
            showAddCarSection();
            break;
    }
}

function initializeAddCarForm() {
    const addCarForm = document.getElementById('add-car-form');
    const addCarBtn = document.getElementById('add-car-btn');
    const cancelAddCarBtn = document.getElementById('cancel-add-car');
    
    if (addCarForm) {
        addCarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddCar();
        });
    }
    
    if (addCarBtn) {
        addCarBtn.addEventListener('click', function() {
            showAddCarSection();
        });
    }
    
    if (cancelAddCarBtn) {
        cancelAddCarBtn.addEventListener('click', function() {
            hideAddCarSection();
        });
    }
    
    // Initialize image upload
    initializeImageUpload();
}

function showAddCarSection() {
    const addCarSection = document.getElementById('add-car-section');
    if (addCarSection) {
        addCarSection.style.display = 'block';
        
        // Update navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('[data-section="add-car"]').classList.add('active');
        
        // Show add car section
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        addCarSection.classList.add('active');
    }
}

function hideAddCarSection() {
    const addCarSection = document.getElementById('add-car-section');
    if (addCarSection) {
        addCarSection.style.display = 'none';
        
        // Reset form
        const form = document.getElementById('add-car-form');
        if (form) {
            form.reset();
        }
        
        // Clear uploaded images
        const uploadedImages = document.getElementById('uploaded-images');
        if (uploadedImages) {
            uploadedImages.innerHTML = '';
        }
    }
}

function initializeImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('car-images');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            handleImageUpload(files);
        });
        
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            handleImageUpload(files);
        });
    }
}

function handleImageUpload(files) {
    const uploadedImages = document.getElementById('uploaded-images');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'uploaded-image';
                imageContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image">
                    <button type="button" class="remove-image" onclick="removeUploadedImage(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                uploadedImages.appendChild(imageContainer);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeUploadedImage(button) {
    const imageContainer = button.parentElement;
    imageContainer.remove();
}

async function handleAddCar() {
    const form = document.getElementById('add-car-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Get uploaded images
    const uploadedImages = document.querySelectorAll('.uploaded-image img');
    data.images = Array.from(uploadedImages).map(img => img.src);
    
    try {
        RentifyApp.showLoading();
        
        const response = await RentifyApp.apiCall('cars.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            RentifyApp.showNotification('Car added successfully!', 'success');
            hideAddCarSection();
            loadOwnerCars(); // Refresh cars list
        } else {
            RentifyApp.showNotification(response.message || 'Failed to add car', 'error');
        }
    } catch (error) {
        console.error('Error adding car:', error);
        RentifyApp.showNotification('Failed to add car', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        RentifyApp.showLoading();
        
        const response = await RentifyApp.apiCall('bookings.php', {
            method: 'PUT',
            body: JSON.stringify({
                booking_id: bookingId,
                status: status
            })
        });
        
        if (response.success) {
            RentifyApp.showNotification('Booking status updated successfully!', 'success');
            loadOwnerBookings(); // Refresh bookings
        } else {
            RentifyApp.showNotification(response.message || 'Failed to update booking status', 'error');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        RentifyApp.showNotification('Failed to update booking status', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

async function toggleCarAvailability(carId, currentStatus) {
    try {
        RentifyApp.showLoading();
        
        // This would call an API to toggle car availability
        // For now, we'll simulate the action
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        RentifyApp.showNotification(`Car ${currentStatus ? 'disabled' : 'enabled'} successfully!`, 'success');
        loadOwnerCars(); // Refresh cars list
    } catch (error) {
        console.error('Error toggling car availability:', error);
        RentifyApp.showNotification('Failed to update car availability', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

async function deleteCar(carId) {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
        return;
    }
    
    try {
        RentifyApp.showLoading();
        
        // This would call an API to delete the car
        // For now, we'll simulate the action
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        RentifyApp.showNotification('Car deleted successfully!', 'success');
        loadOwnerCars(); // Refresh cars list
    } catch (error) {
        console.error('Error deleting car:', error);
        RentifyApp.showNotification('Failed to delete car', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

function editCar(carId) {
    // This would open an edit form for the car
    RentifyApp.showNotification('Edit functionality coming soon!', 'info');
}