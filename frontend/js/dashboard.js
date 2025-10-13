// Dashboard JavaScript
// Handles user dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Check authentication
    if (!RentifyApp.currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeDashboardNavigation();
    loadDashboardData();
    initializeProfileForm();
}

function initializeDashboardNavigation() {
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
            loadSectionData(targetSection);
        });
    });
}

async function loadDashboardData() {
    try {
        RentifyApp.showLoading();
        
        // Load user profile
        const profileResponse = await RentifyApp.apiCall('auth_profile.php');
        if (profileResponse.success) {
            displayUserProfile(profileResponse.data);
        }
        
        // Load bookings
        const bookingsResponse = await RentifyApp.apiCall('bookings.php');
        if (bookingsResponse.success) {
            displayBookings(bookingsResponse.data);
            updateBookingStats(bookingsResponse.data);
        }
        
        // Load wishlist (placeholder)
        loadWishlist();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        RentifyApp.showNotification('Failed to load dashboard data', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

function displayUserProfile(user) {
    const elements = {
        'welcome-name': user.name,
        'profile-name': user.name,
        'profile-email': user.email,
        'profile-phone': user.phone || 'Not provided',
        'profile-license': user.license_number || 'Not provided',
        'profile-joined': new Date(user.created_at).toLocaleDateString()
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function displayBookings(bookings) {
    const recentBookingsContainer = document.getElementById('recent-bookings');
    const allBookingsContainer = document.getElementById('all-bookings');
    
    if (recentBookingsContainer) {
        const recentBookings = bookings.slice(0, 3);
        recentBookingsContainer.innerHTML = recentBookings.map(booking => createBookingHTML(booking)).join('');
    }
    
    if (allBookingsContainer) {
        allBookingsContainer.innerHTML = bookings.map(booking => createBookingHTML(booking)).join('');
    }
}

function createBookingHTML(booking) {
    const statusClass = booking.status.toLowerCase();
    const statusIcon = getStatusIcon(booking.status);
    
    return `
        <div class="booking-item">
            <div class="booking-image">
                <img src="${booking.images && booking.images.length > 0 ? booking.images[0] : 'images/placeholder-car.jpg'}" alt="${booking.car_title}">
            </div>
            <div class="booking-details">
                <h4>${booking.car_title}</h4>
                <p class="booking-car-info">${booking.brand} ${booking.model}</p>
                <div class="booking-dates">
                    <span><i class="fas fa-calendar"></i> ${new Date(booking.start_date).toLocaleDateString()}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
                <div class="booking-owner">
                    <i class="fas fa-user"></i>
                    <span>Owner: ${booking.owner_name}</span>
                </div>
            </div>
            <div class="booking-status">
                <div class="status-badge ${statusClass}">
                    <i class="fas fa-${statusIcon}"></i>
                    ${booking.status}
                </div>
                <div class="booking-amount">
                    $${booking.total_amount}
                </div>
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    const icons = {
        'pending': 'clock',
        'confirmed': 'check-circle',
        'cancelled': 'times-circle',
        'completed': 'check-double'
    };
    return icons[status.toLowerCase()] || 'question-circle';
}

function updateBookingStats(bookings) {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
    const totalSpent = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    
    document.getElementById('total-bookings').textContent = totalBookings;
    document.getElementById('active-bookings').textContent = activeBookings;
    document.getElementById('total-spent').textContent = `$${totalSpent.toFixed(2)}`;
}

function loadWishlist() {
    // Placeholder for wishlist functionality
    const wishlistPreview = document.getElementById('wishlist-preview');
    if (wishlistPreview) {
        wishlistPreview.innerHTML = '<p>No items in wishlist</p>';
    }
    
    document.getElementById('wishlist-count').textContent = '0';
}

function loadSectionData(section) {
    switch (section) {
        case 'bookings':
            loadBookingsSection();
            break;
        case 'wishlist':
            loadWishlistSection();
            break;
        case 'profile':
            loadProfileSection();
            break;
        case 'settings':
            loadSettingsSection();
            break;
    }
}

function loadBookingsSection() {
    // Initialize booking filters
    const statusFilter = document.getElementById('booking-status-filter');
    const dateFromFilter = document.getElementById('booking-date-from');
    const dateToFilter = document.getElementById('booking-date-to');
    const filterBtn = document.getElementById('filter-bookings');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            filterBookings();
        });
    }
}

function filterBookings() {
    const status = document.getElementById('booking-status-filter').value;
    const dateFrom = document.getElementById('booking-date-from').value;
    const dateTo = document.getElementById('booking-date-to').value;
    
    // This would filter the displayed bookings
    RentifyApp.showNotification('Filtering bookings...', 'info');
}

function loadWishlistSection() {
    const wishlistGrid = document.getElementById('wishlist-grid');
    if (wishlistGrid) {
        wishlistGrid.innerHTML = '<p class="text-center">No items in wishlist</p>';
    }
}

function loadProfileSection() {
    // Profile section is already loaded in loadDashboardData
}

function loadSettingsSection() {
    // Initialize settings toggles
    const emailNotifications = document.getElementById('email-notifications');
    const smsNotifications = document.getElementById('sms-notifications');
    const profileVisibility = document.getElementById('profile-visibility');
    
    if (emailNotifications) {
        emailNotifications.addEventListener('change', function() {
            saveSetting('email_notifications', this.checked);
        });
    }
    
    if (smsNotifications) {
        smsNotifications.addEventListener('change', function() {
            saveSetting('sms_notifications', this.checked);
        });
    }
    
    if (profileVisibility) {
        profileVisibility.addEventListener('change', function() {
            saveSetting('profile_visibility', this.value);
        });
    }
}

function saveSetting(key, value) {
    // This would save settings to the backend
    RentifyApp.showNotification('Setting saved', 'success');
}

function initializeProfileForm() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileForm = document.getElementById('profile-form');
    const updateProfileForm = document.getElementById('update-profile-form');
    const cancelEditBtn = document.getElementById('cancel-edit-profile');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            showProfileForm();
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            hideProfileForm();
        });
    }
    
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleProfileUpdate();
        });
    }
}

function showProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.style.display = 'block';
        
        // Populate form with current data
        const currentUser = RentifyApp.currentUser;
        if (currentUser) {
            document.getElementById('edit-name').value = currentUser.name || '';
            document.getElementById('edit-phone').value = currentUser.phone || '';
            document.getElementById('edit-license').value = currentUser.license_number || '';
        }
    }
}

function hideProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.style.display = 'none';
    }
}

async function handleProfileUpdate() {
    const form = document.getElementById('update-profile-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        RentifyApp.showLoading();
        
        // This would call a profile update API endpoint
        // const response = await RentifyApp.apiCall('auth_profile.php', {
        //     method: 'PUT',
        //     body: JSON.stringify(data)
        // });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        RentifyApp.showNotification('Profile updated successfully!', 'success');
        hideProfileForm();
        
        // Update current user data
        Object.assign(RentifyApp.currentUser, data);
        
        // Refresh profile display
        displayUserProfile(RentifyApp.currentUser);
        
    } catch (error) {
        console.error('Error updating profile:', error);
        RentifyApp.showNotification('Failed to update profile', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}