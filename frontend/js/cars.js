// Cars Page JavaScript
// Handles car listing, filtering, and search functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeCarsPage();
});

function initializeCarsPage() {
    // Load cars on page load
    loadCarsFromURL();
    
    // Initialize search form
    initializeSearchForm();
    
    // Initialize filters
    initializeCarsFilters();
    
    // Initialize view toggle
    initializeViewToggle();
    
    // Load brands for filter
    loadBrands();
}

function loadCarsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    
    // Extract filters from URL
    if (urlParams.get('city')) filters.city = urlParams.get('city');
    if (urlParams.get('start_date')) filters.start_date = urlParams.get('start_date');
    if (urlParams.get('end_date')) filters.end_date = urlParams.get('end_date');
    
    // Apply filters to form
    if (filters.city) {
        const locationInput = document.getElementById('search-location');
        if (locationInput) locationInput.value = filters.city;
    }
    
    if (filters.start_date) {
        const pickupInput = document.getElementById('search-pickup');
        if (pickupInput) pickupInput.value = filters.start_date;
    }
    
    if (filters.end_date) {
        const returnInput = document.getElementById('search-return');
        if (returnInput) returnInput.value = filters.end_date;
    }
    
    // Load cars with filters
    loadCars(filters);
}

function initializeSearchForm() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
}

function performSearch() {
    const location = document.getElementById('search-location').value;
    const pickup = document.getElementById('search-pickup').value;
    const returnDate = document.getElementById('search-return').value;
    
    const filters = {};
    if (location) filters.city = location;
    if (pickup) filters.start_date = pickup;
    if (returnDate) filters.end_date = returnDate;
    
    // Update URL
    const urlParams = new URLSearchParams(filters);
    window.history.pushState({}, '', `cars.html?${urlParams.toString()}`);
    
    // Load cars with new filters
    loadCars(filters);
}

function initializeCarsFilters() {
    const filterElements = document.querySelectorAll('#filter-brand, #filter-type, #filter-fuel, #filter-transmission, #min-price, #max-price, #sort-by');
    
    filterElements.forEach(element => {
        element.addEventListener('change', function() {
            applyCarsFilters();
        });
    });
    
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearCarsFilters();
        });
    }
}

function applyCarsFilters() {
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

function clearCarsFilters() {
    document.getElementById('filter-brand').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-fuel').value = '';
    document.getElementById('filter-transmission').value = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.getElementById('sort-by').value = 'newest';
    
    loadCars();
}

function initializeViewToggle() {
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const carsGrid = document.getElementById('cars-grid');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            carsGrid.classList.remove('list-view');
            carsGrid.classList.add('grid-view');
        });
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', function() {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            carsGrid.classList.remove('grid-view');
            carsGrid.classList.add('list-view');
        });
    }
}

async function loadBrands() {
    try {
        const response = await RentifyApp.apiCall('cars.php');
        if (response.success) {
            const brands = [...new Set(response.data.cars.map(car => car.brand))].sort();
            const brandSelect = document.getElementById('filter-brand');
            
            if (brandSelect) {
                const existingOptions = brandSelect.querySelectorAll('option');
                if (existingOptions.length <= 1) { // Only "All Brands" option
                    brands.forEach(brand => {
                        const option = document.createElement('option');
                        option.value = brand;
                        option.textContent = brand;
                        brandSelect.appendChild(option);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

// Override the main loadCars function for cars page
async function loadCars(filters = {}) {
    try {
        showLoading();
        
        const queryParams = new URLSearchParams(filters);
        const response = await RentifyApp.apiCall(`cars.php?${queryParams}`);
        
        if (response.success) {
            displayCars(response.data.cars, 'cars-grid');
            updateCarsCount(response.data.pagination.total_cars);
            updatePagination(response.data.pagination);
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        RentifyApp.showNotification('Failed to load cars', 'error');
    } finally {
        hideLoading();
    }
}

function displayCars(cars, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (cars.length === 0) {
        container.innerHTML = `
            <div class="no-cars-found">
                <i class="fas fa-car" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No cars found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
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
                <div class="car-actions">
                    <button class="btn btn-outline" onclick="addToWishlist(${car.id})">
                        <i class="fas fa-heart"></i>
                        Wishlist
                    </button>
                    <button class="btn btn-primary" onclick="viewCarDetails(${car.id})">
                        <i class="fas fa-calendar-check"></i>
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = carsHTML;
}

function updateCarsCount(count) {
    const countElement = document.getElementById('cars-count');
    if (countElement) {
        countElement.textContent = `${count} cars found`;
    }
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

function viewCarDetails(carId) {
    window.location.href = `car.html?id=${carId}`;
}

async function addToWishlist(carId) {
    if (!RentifyApp.currentUser) {
        showAuthModal('login');
        return;
    }
    
    try {
        // This would be implemented with a wishlist API endpoint
        RentifyApp.showNotification('Added to wishlist!', 'success');
    } catch (error) {
        RentifyApp.showNotification('Failed to add to wishlist', 'error');
    }
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