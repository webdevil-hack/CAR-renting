// Admin Dashboard JavaScript
// Handles admin dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    // Check authentication and role
    if (!RentifyApp.currentUser || RentifyApp.currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeAdminNavigation();
    loadAdminDashboardData();
    initializeCouponModal();
}

function initializeAdminNavigation() {
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
            loadAdminSectionData(targetSection);
        });
    });
}

async function loadAdminDashboardData() {
    try {
        RentifyApp.showLoading();
        
        // Load admin dashboard statistics
        const response = await RentifyApp.apiCall('admin.php');
        if (response.success) {
            displayAdminStats(response.data);
            displayRecentBookings(response.data.recent_bookings);
            displayRecentUsers(response.data.recent_users);
        }
        
    } catch (error) {
        console.error('Error loading admin dashboard data:', error);
        RentifyApp.showNotification('Failed to load dashboard data', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

function displayAdminStats(data) {
    const stats = {
        'total-customers': data.total_customers,
        'total-owners': data.total_owners,
        'total-cars': data.total_cars,
        'total-bookings': data.total_bookings,
        'total-revenue': `$${data.total_revenue.toLocaleString()}`,
        'confirmed-bookings': data.confirmed_bookings
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function displayRecentBookings(bookings) {
    const container = document.getElementById('recent-bookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No recent bookings</p>';
        return;
    }
    
    const bookingsHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-image">
                <img src="${booking.images && booking.images.length > 0 ? booking.images[0] : 'images/placeholder-car.jpg'}" alt="${booking.car_title}">
            </div>
            <div class="booking-details">
                <h4>${booking.car_title}</h4>
                <p class="booking-customer">Customer: ${booking.customer_name}</p>
                <div class="booking-dates">
                    <span><i class="fas fa-calendar"></i> ${new Date(booking.start_date).toLocaleDateString()}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="booking-status">
                <span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span>
                <span class="booking-amount">$${booking.total_amount}</span>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = bookingsHTML;
}

function displayRecentUsers(users) {
    const container = document.getElementById('recent-users');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p>No recent users</p>';
        return;
    }
    
    const usersHTML = users.map(user => `
        <div class="user-item">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
                <h4>${user.name}</h4>
                <p>${user.email}</p>
                <span class="user-role ${user.role}">${user.role}</span>
            </div>
            <div class="user-date">
                ${new Date(user.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = usersHTML;
}

function loadAdminSectionData(section) {
    switch (section) {
        case 'users':
            loadUsersSection();
            break;
        case 'cars':
            loadCarsSection();
            break;
        case 'bookings':
            loadBookingsSection();
            break;
        case 'payments':
            loadPaymentsSection();
            break;
        case 'coupons':
            loadCouponsSection();
            break;
        case 'analytics':
            loadAnalyticsSection();
            break;
    }
}

async function loadUsersSection() {
    try {
        // This would load users from the backend
        // For now, we'll simulate the data
        const users = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'customer',
                phone: '123-456-7890',
                created_at: '2024-01-15'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'owner',
                phone: '098-765-4321',
                created_at: '2024-01-20'
            }
        ];
        
        displayUsersTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    const usersHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-role ${user.role}">${user.role}</span></td>
            <td>${user.phone || 'N/A'}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <div class="user-actions">
                    <button class="btn btn-sm btn-outline" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = usersHTML;
}

async function loadCarsSection() {
    try {
        const response = await RentifyApp.apiCall('cars.php');
        if (response.success) {
            displayAdminCars(response.data.cars);
        }
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

function displayAdminCars(cars) {
    const container = document.getElementById('admin-cars-grid');
    if (!container) return;
    
    if (cars.length === 0) {
        container.innerHTML = '<p class="text-center">No cars found</p>';
        return;
    }
    
    const carsHTML = cars.map(car => `
        <div class="car-card admin-car-card">
            <div class="car-image">
                <img src="${car.images && car.images.length > 0 ? car.images[0] : 'images/placeholder-car.jpg'}" alt="${car.title}">
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.title}</h3>
                <p class="car-owner">Owner: ${car.owner_name}</p>
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
                    <button class="btn btn-sm btn-outline" onclick="editCar(${car.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCar(${car.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = carsHTML;
}

async function loadBookingsSection() {
    try {
        const response = await RentifyApp.apiCall('bookings.php');
        if (response.success) {
            displayAdminBookings(response.data);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayAdminBookings(bookings) {
    const container = document.getElementById('admin-bookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-center">No bookings found</p>';
        return;
    }
    
    const bookingsHTML = bookings.map(booking => `
        <div class="booking-item admin-booking">
            <div class="booking-image">
                <img src="${booking.images && booking.images.length > 0 ? booking.images[0] : 'images/placeholder-car.jpg'}" alt="${booking.car_title}">
            </div>
            <div class="booking-details">
                <h4>${booking.car_title}</h4>
                <p class="booking-customer">Customer: ${booking.customer_name || 'Unknown'}</p>
                <p class="booking-owner">Owner: ${booking.owner_name || 'Unknown'}</p>
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
                    <button class="btn btn-sm btn-primary" onclick="updateBookingStatus(${booking.id}, 'confirmed')">
                        <i class="fas fa-check"></i>
                        Confirm
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateBookingStatus(${booking.id}, 'cancelled')">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = bookingsHTML;
}

async function loadPaymentsSection() {
    try {
        // This would load payments from the backend
        // For now, we'll simulate the data
        const payments = [
            {
                id: 1,
                transaction_id: 'TXN_123456',
                booking_id: 1,
                amount: 150.00,
                status: 'completed',
                created_at: '2024-01-15'
            },
            {
                id: 2,
                transaction_id: 'TXN_789012',
                booking_id: 2,
                amount: 200.00,
                status: 'completed',
                created_at: '2024-01-16'
            }
        ];
        
        displayPaymentsTable(payments);
        updatePaymentStats(payments);
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

function displayPaymentsTable(payments) {
    const tbody = document.getElementById('payments-table-body');
    if (!tbody) return;
    
    const paymentsHTML = payments.map(payment => `
        <tr>
            <td>${payment.transaction_id}</td>
            <td>${payment.booking_id}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
            <td>${new Date(payment.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
    
    tbody.innerHTML = paymentsHTML;
}

function updatePaymentStats(payments) {
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedPayments = payments.filter(payment => payment.status === 'completed').length;
    
    document.getElementById('total-revenue-amount').textContent = `$${totalRevenue.toLocaleString()}`;
    document.getElementById('completed-payments').textContent = completedPayments;
    
    // Calculate monthly revenue (simplified)
    const monthlyRevenue = totalRevenue * 0.1; // 10% of total as monthly
    document.getElementById('monthly-revenue').textContent = `$${monthlyRevenue.toLocaleString()}`;
}

async function loadCouponsSection() {
    try {
        // This would load coupons from the backend
        // For now, we'll simulate the data
        const coupons = [
            {
                id: 1,
                code: 'WELCOME20',
                discount_type: 'percentage',
                discount_value: 20,
                min_amount: 100,
                expires_at: '2024-12-31',
                is_active: true
            },
            {
                id: 2,
                code: 'SAVE50',
                discount_type: 'fixed',
                discount_value: 50,
                min_amount: 200,
                expires_at: '2024-06-30',
                is_active: true
            }
        ];
        
        displayCouponsList(coupons);
    } catch (error) {
        console.error('Error loading coupons:', error);
    }
}

function displayCouponsList(coupons) {
    const container = document.getElementById('coupons-list');
    if (!container) return;
    
    if (coupons.length === 0) {
        container.innerHTML = '<p class="text-center">No coupons found</p>';
        return;
    }
    
    const couponsHTML = coupons.map(coupon => `
        <div class="coupon-item">
            <div class="coupon-info">
                <h4>${coupon.code}</h4>
                <p class="coupon-discount">
                    ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`} off
                </p>
                <p class="coupon-min">Min: $${coupon.min_amount}</p>
                <p class="coupon-expires">Expires: ${new Date(coupon.expires_at).toLocaleDateString()}</p>
            </div>
            <div class="coupon-status">
                <span class="status-badge ${coupon.is_active ? 'active' : 'inactive'}">
                    ${coupon.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="coupon-actions">
                <button class="btn btn-sm btn-outline" onclick="editCoupon(${coupon.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCoupon(${coupon.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = couponsHTML;
}

function loadAnalyticsSection() {
    // This would load analytics charts
    // For now, we'll show placeholder content
    const revenueChart = document.getElementById('revenue-chart');
    const carTypesChart = document.getElementById('car-types-chart');
    
    if (revenueChart) {
        revenueChart.innerHTML = '<p>Revenue chart will be displayed here</p>';
    }
    
    if (carTypesChart) {
        carTypesChart.innerHTML = '<p>Car types distribution chart will be displayed here</p>';
    }
}

function initializeCouponModal() {
    const createCouponBtn = document.getElementById('create-coupon-btn');
    const couponModal = document.getElementById('create-coupon-modal');
    const closeCouponModal = document.getElementById('close-coupon-modal');
    const createCouponForm = document.getElementById('create-coupon-form');
    const cancelCoupon = document.getElementById('cancel-coupon');
    
    if (createCouponBtn) {
        createCouponBtn.addEventListener('click', function() {
            showCouponModal();
        });
    }
    
    if (closeCouponModal) {
        closeCouponModal.addEventListener('click', function() {
            hideCouponModal();
        });
    }
    
    if (cancelCoupon) {
        cancelCoupon.addEventListener('click', function() {
            hideCouponModal();
        });
    }
    
    if (createCouponForm) {
        createCouponForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateCoupon();
        });
    }
}

function showCouponModal() {
    const modal = document.getElementById('create-coupon-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideCouponModal() {
    const modal = document.getElementById('create-coupon-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = document.getElementById('create-coupon-form');
        if (form) {
            form.reset();
        }
    }
}

async function handleCreateCoupon() {
    const form = document.getElementById('create-coupon-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        RentifyApp.showLoading();
        
        const response = await RentifyApp.apiCall('coupons.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            RentifyApp.showNotification('Coupon created successfully!', 'success');
            hideCouponModal();
            loadCouponsSection(); // Refresh coupons list
        } else {
            RentifyApp.showNotification(response.message || 'Failed to create coupon', 'error');
        }
    } catch (error) {
        console.error('Error creating coupon:', error);
        RentifyApp.showNotification('Failed to create coupon', 'error');
    } finally {
        RentifyApp.hideLoading();
    }
}

// Action functions
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
            loadBookingsSection(); // Refresh bookings
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

function editUser(userId) {
    RentifyApp.showNotification('Edit user functionality coming soon!', 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        RentifyApp.showNotification('Delete user functionality coming soon!', 'info');
    }
}

function editCar(carId) {
    RentifyApp.showNotification('Edit car functionality coming soon!', 'info');
}

function deleteCar(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
        RentifyApp.showNotification('Delete car functionality coming soon!', 'info');
    }
}

function editCoupon(couponId) {
    RentifyApp.showNotification('Edit coupon functionality coming soon!', 'info');
}

function deleteCoupon(couponId) {
    if (confirm('Are you sure you want to delete this coupon?')) {
        RentifyApp.showNotification('Delete coupon functionality coming soon!', 'info');
    }
}