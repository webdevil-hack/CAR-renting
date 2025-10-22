# Rentify - Premium Car Rental Platform

A modern, full-stack car rental platform built with HTML5, CSS3, JavaScript, PHP, and MySQL. Features a beautiful, responsive design with glassmorphism effects, smooth animations, and comprehensive functionality for customers, car owners, and administrators.

## 🚗 Features

### 🎨 Modern Design
- **Glassmorphism UI** with beautiful gradients and transparency effects
- **Smooth animations** using AOS (Animate On Scroll) and custom CSS animations
- **Responsive design** that works perfectly on desktop, tablet, and mobile
- **Modern color palette** with teal green (#00B894), blue (#0984E3), and orange (#FD9644) accents
- **Elegant typography** using Poppins and Inter fonts

### 👥 User Roles

#### Customer/User
- Browse and search cars with advanced filters
- View detailed car information with image galleries
- Book cars with date selection and coupon support
- Manage bookings and view booking history
- Add cars to wishlist
- User dashboard with statistics and profile management

#### Car Owner
- List and manage their cars
- Upload multiple car images
- Track bookings and earnings
- Manage car availability
- Owner dashboard with analytics and insights

#### Admin
- Manage all users, cars, and bookings
- Create and manage discount coupons
- View platform analytics and statistics
- Approve or deactivate car listings
- Comprehensive admin dashboard

### 🔧 Core Functionality

#### Authentication System
- User registration and login with role-based access
- Password encryption using SHA-256
- "Remember Me" functionality with localStorage
- JWT token-based authentication
- Role-based redirection after login

#### Car Management
- Advanced car search with filters (brand, type, fuel, price, location)
- Detailed car pages with image galleries
- Car specifications and owner information
- Real-time availability checking
- Car rating and review system

#### Booking System
- Date and time selection for pickup/return
- Real-time price calculation
- Coupon code validation and discount application
- Booking status management (pending, confirmed, cancelled, completed)
- Email notifications (simulated)

#### Payment System
- Mock payment processing
- Payment status tracking
- Transaction history
- Integration-ready for Razorpay/Stripe

#### Dashboard Analytics
- User statistics and booking history
- Owner earnings and car performance
- Admin platform analytics
- Interactive charts and graphs

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript** - No frameworks, pure JS for better performance
- **AOS (Animate On Scroll)** - Smooth scroll animations
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Backend
- **PHP 7.4+** - Server-side logic
- **MySQL 5.7+** - Database
- **PDO** - Database abstraction layer
- **JWT** - Token-based authentication

### Design Features
- **Glassmorphism** - Frosted glass effects
- **Gradient backgrounds** - Beautiful color transitions
- **Smooth animations** - Hover effects and transitions
- **Responsive grid** - CSS Grid and Flexbox layouts
- **Custom scrollbars** - Styled scrollbars
- **Loading states** - Preloader and loading indicators

## 📁 Project Structure

```
Rentify/
├── backend/
│   ├── api/
│   │   ├── auth_login.php          # User login endpoint
│   │   ├── auth_register.php       # User registration endpoint
│   │   ├── auth_profile.php        # User profile endpoint
│   │   ├── cars.php                # Cars listing and creation
│   │   ├── car.php                 # Single car details
│   │   ├── bookings.php            # Booking management
│   │   ├── payment_stub.php        # Mock payment processing
│   │   ├── coupons.php             # Coupon management
│   │   └── admin.php               # Admin dashboard data
│   ├── db.php                      # Database connection
│   ├── helpers.php                 # Helper functions
│   └── config.php                  # Configuration
├── frontend/
│   ├── index.html                  # Homepage
│   ├── cars.html                   # Car listings page
│   ├── car.html                    # Car details page
│   ├── dashboard.html              # User dashboard
│   ├── owner.html                  # Owner dashboard
│   ├── admin.html                  # Admin dashboard
│   ├── contact.html                # Contact page
│   ├── css/
│   │   └── style.css               # Main stylesheet
│   ├── js/
│   │   ├── app.js                  # Main application logic
│   │   ├── cars.js                 # Cars page functionality
│   │   ├── car-details.js          # Car details functionality
│   │   ├── dashboard.js            # User dashboard
│   │   ├── owner.js                # Owner dashboard
│   │   ├── admin.js                # Admin dashboard
│   │   └── contact.js              # Contact page functionality
│   └── images/                     # Image assets
├── sql/
│   └── schema.sql                  # Database schema
└── README.md                       # This file
```

## 🚀 Installation & Setup

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Modern web browser

### Database Setup
1. Create a MySQL database named `rentify`
2. Import the database schema:
   ```sql
   mysql -u username -p rentify < sql/schema.sql
   ```

### Configuration
1. Update database credentials in `backend/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'rentify');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```

2. Set up your web server to serve the project from the root directory

### Default Accounts
The system comes with pre-configured test accounts:

- **Admin**: admin@rentify.com / admin123
- **Owner**: owner@rentify.com / owner123
- **Customer**: customer@rentify.com / customer123

## 🎯 Usage

### For Customers
1. **Browse Cars**: Visit the homepage or cars page to browse available vehicles
2. **Search & Filter**: Use the search bar and filters to find specific cars
3. **View Details**: Click on any car to see detailed information and images
4. **Book a Car**: Select dates and complete the booking process
5. **Manage Bookings**: Access your dashboard to view and manage bookings

### For Car Owners
1. **Register as Owner**: Sign up with the "owner" role
2. **Add Cars**: Use the owner dashboard to list your vehicles
3. **Manage Listings**: Edit car details, upload images, set availability
4. **Track Bookings**: Monitor bookings and earnings in your dashboard

### For Administrators
1. **Access Admin Panel**: Login with admin credentials
2. **Manage Users**: View and manage all platform users
3. **Oversee Cars**: Monitor and approve car listings
4. **Handle Bookings**: Manage all bookings and payments
5. **Create Coupons**: Set up discount codes and promotions

## 🎨 Design Features

### Color Palette
- **Primary**: #00B894 (Teal Green)
- **Secondary**: #0984E3 (Blue)
- **Accent**: #FD9644 (Orange)
- **Background**: White with light gray gradients
- **Text**: Dark gray (#2d3436)

### Typography
- **Headings**: Poppins (Bold, 600-800 weight)
- **Body**: Inter (Regular, 300-600 weight)
- **Icons**: Font Awesome 6.4.0

### Animations
- **AOS (Animate On Scroll)**: Fade and slide animations
- **Hover Effects**: Smooth transitions on interactive elements
- **Loading States**: Preloader and loading spinners
- **Micro-interactions**: Button hover effects and form feedback

## 🔒 Security Features

- **SQL Injection Protection**: PDO prepared statements
- **Password Hashing**: SHA-256 encryption
- **JWT Authentication**: Secure token-based sessions
- **Input Validation**: Server-side validation and sanitization
- **Role-based Access Control**: Proper permission management

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop**: 1200px+ (Full feature set)
- **Tablet**: 768px - 1199px (Adapted layout)
- **Mobile**: 320px - 767px (Mobile-first design)

## 🚀 Performance Optimizations

- **Vanilla JavaScript**: No framework overhead
- **CSS Grid & Flexbox**: Efficient layouts
- **Image Optimization**: Responsive images and lazy loading
- **Minimal Dependencies**: Only essential libraries
- **Efficient API Calls**: Optimized database queries

## 🔧 Customization

### Adding New Features
1. **Backend**: Add new API endpoints in `backend/api/`
2. **Frontend**: Create new pages and JavaScript modules
3. **Database**: Update schema in `sql/schema.sql`
4. **Styling**: Modify CSS variables in `frontend/css/style.css`

### Theming
The color scheme can be easily customized by updating CSS variables in `style.css`:
```css
:root {
    --primary-color: #00B894;
    --secondary-color: #0984E3;
    --accent-color: #FD9644;
    /* ... other variables */
}
```

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check credentials in `config.php`
2. **File Permissions**: Ensure web server can read all files
3. **PHP Version**: Requires PHP 7.4+ for proper functionality
4. **CORS Issues**: Check server configuration for API calls

### Debug Mode
Enable error reporting in `backend/config.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📄 License

This project is created for educational and demonstration purposes. Feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For support or questions, please contact:
- Email: info@rentify.com
- Phone: +1 (555) 123-4567

---

**Rentify** - Your trusted partner for premium car rental services. Experience comfort, reliability, and exceptional service.