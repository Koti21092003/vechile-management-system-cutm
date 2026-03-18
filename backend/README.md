# CUTM-VMS Backend API

Backend REST API for CUTM Vehicle Management System built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file is already configured with your MongoDB connection.

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📝 Test Credentials

- **Admin**: admin@cutmap.ac.in / admin123
- **Driver**: john@cutmap.ac.in / driver123
- **Staff**: jane@cutmap.ac.in / staff123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/update-password` - Update password (Protected)

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle (Admin)
- `GET /api/vehicles/:id` - Get single vehicle
- `PUT /api/vehicles/:id` - Update vehicle (Admin)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin)
- `PATCH /api/vehicles/:id/assign-driver` - Assign driver (Admin)

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create driver (Admin)
- `GET /api/drivers/:id` - Get single driver
- `PUT /api/drivers/:id` - Update driver (Admin)
- `DELETE /api/drivers/:id` - Delete driver (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `PATCH /api/bookings/:id/approve` - Approve booking (Admin)
- `PATCH /api/bookings/:id/decline` - Decline booking (Admin)

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `GET /api/trips/:id` - Get single trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `PATCH /api/trips/:id/start` - Start trip (Driver/Admin)
- `PATCH /api/trips/:id/complete` - Complete trip (Driver/Admin)

### Fuel Records
- `GET /api/fuel` - Get all fuel records
- `POST /api/fuel` - Create fuel record
- `GET /api/fuel/:id` - Get single fuel record
- `PUT /api/fuel/:id` - Update fuel record
- `DELETE /api/fuel/:id` - Delete fuel record

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications/:id` - Get single notification
- `PATCH /api/notifications/:id/mark-read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔒 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📊 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message"
}
```

## 🧪 Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

Test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cutmap.ac.in","password":"admin123"}'
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── vehicle.controller.js
│   ├── driver.controller.js
│   ├── booking.controller.js
│   ├── trip.controller.js
│   ├── fuel.controller.js
│   └── notification.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── validation.middleware.js
├── models/
│   ├── User.model.js
│   ├── Vehicle.model.js
│   ├── Driver.model.js
│   ├── Booking.model.js
│   ├── Trip.model.js
│   ├── Fuel.model.js
│   └── Notification.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── vehicle.routes.js
│   ├── driver.routes.js
│   ├── booking.routes.js
│   ├── trip.routes.js
│   ├── fuel.routes.js
│   └── notification.routes.js
├── scripts/
│   └── seedData.js
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## 🔧 Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - CORS handling
- **morgan** - Logging

## 📝 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with test data
```

## ✅ Features

- ✅ JWT Authentication
- ✅ Password Hashing
- ✅ Role-Based Authorization
- ✅ Input Validation
- ✅ Error Handling
- ✅ Security Headers
- ✅ CORS Protection
- ✅ MongoDB Integration
- ✅ RESTful API Design

## 🎯 Next Steps

1. Start the backend server: `npm run dev`
2. Test API endpoints with Postman or curl
3. Integrate with frontend React application
4. Deploy to production (Heroku, Railway, etc.)

## 📞 Support

For issues, check:
- Server logs in terminal
- MongoDB Atlas dashboard
- Network tab in browser DevTools
