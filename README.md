# Centurion University Vehicle Management System (CUTM-VMS)

A comprehensive, real-time MERN stack application designed to streamline vehicle logistics, automate trip bookings, and manage drivers effortlessly for university operations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen)

---

## 🌟 Key Features

- **Real-Time Synchronization**: Powered by `Socket.io`, all dashboards update instantaneously across all connected devices when bookings, trips, or fuel records are altered. No refreshing required.
- **Role-Based Access Control**: Secure JWT-powered authentication segregating access between `Admin`, `Driver`, and `Staff/Faculty`.
- **Intelligent Dashboards**: Visual analytics, real-time notification alerts, and global search functionality.
- **Trip & Asset Tracking**: Track vehicle maintenance statuses, current trips in progress, and automatically compute driver fuel expenses.
- **Automated Seeding System**: Populate the system instantly with randomized mock data (users, vehicles, active trips) for easy deployment testing.

## 🛠️ Technology Stack

- **Frontend**: React (v19), TypeScript, Vite, React Router, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & bcrypt

---

## ⚙️ Step-by-Step Local Installation

Follow these instructions strictly to get a local development environment running. 

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/Koti21092003/vechile-management-system-cutm.git
cd vechile-management-system-cutm
```

### 3. Backend Setup
Navigate into the backend directory and install the required modules.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add your database configuration:
```env
# backend/.env 
PORT=5000
MONGO_URI=mongodb+srv://<your-db-username>:<password>@cluster.mongodb.net/cutm-vms
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Automatically seed the database with mock test data:
```bash
npm run seed:all
```

Start the backend server:
```bash
npm run dev
# The backend will start on http://localhost:5000
```

### 4. Frontend Setup
Open a new terminal window / tab, navigate to the frontend directory, and install dependencies.

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` folder to point the React app to your backend:
```env
# frontend/.env.local
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

Your browser should automatically open `http://localhost:5173`. 

---

## 🔐 Default Access Credentials

If you seeded the database using `npm run seed:all`, the following default accounts are available to immediately test the system:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@cutmap.ac.in` | `admin123` |
| **Staff** | `staff@cutmap.ac.in` | `staff123` |
| **Driver 1**| `driver1@cutmap.ac.in` | `driver123` |
| **Driver 2**| `driver2@cutmap.ac.in` | `driver123` |

---

## 🚀 Deployment Instructions

### Deploying the Backend (Render)
1. Link your GitHub repository directly to a new Web Service in [Render.com](https://render.com).
2. Set the root directory to `backend`.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Copy the environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) into the Render Environment panel. Ensure `FRONTEND_URL` is set to your actual Vercel URL.

### Deploying the Frontend (Vercel)
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Set the Root Directory to `frontend`.
3. The Build command will automatically be detected as `npm run build`.
4. Go to Environment Variables and add `VITE_API_URL` pointing strictly to your new, LIVE Render API URL (e.g., `https://vechile-management-system-cutm.onrender.com/api`).
5. Click **Deploy**.

---

*Engineered for Centurion University of Technology and Management.*
