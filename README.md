# 🚛 TransitOps – Smart Fleet Management System

> A modern enterprise-grade Fleet Operations, Maintenance, and Financial Analytics platform built using the MERN Stack.

![React](https://img.shields.io/badge/React-19-blue)
![Node](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# 📖 Overview

TransitOps is a comprehensive Fleet Management System designed to streamline transportation operations for logistics companies.

The platform provides secure role-based access, intelligent trip dispatching, maintenance management, fuel tracking, expense monitoring, and real-time operational analytics through an interactive dashboard.

---

# ✨ Features

## 🔐 Authentication & Security

- JWT Authentication
- Password Encryption (bcrypt)
- Role-Based Access Control (RBAC)
- Protected API Routes

---

## 👥 User Roles

### 👑 Fleet Manager
- Full system access
- Vehicle Management
- Driver Management
- Trip Management
- Maintenance
- Fuel Logs
- Expenses
- Reports

### 🚛 Dispatch Officer
- Create Trips
- Dispatch Trips
- Complete Trips
- Cancel Trips
- View Drivers & Vehicles

### 🚚 Driver
- View Assigned Trips
- Complete Trips
- Submit Fuel Logs

### 🛡 Safety Officer
- View Compliance Reports
- License Expiry Monitoring
- Safety Score Tracking

### 💰 Financial Analyst
- Expense Management
- Fuel Cost Tracking
- Financial Reports
- ROI Analytics

---

# 🚗 Modules

## Vehicle Management

- Register Vehicles
- Vehicle Status Tracking
- Capacity Management
- Odometer Tracking
- Region Assignment

Vehicle Status

- Available
- On Trip
- In Shop
- Retired

---

## Driver Management

- Driver Registration
- License Monitoring
- Safety Scores
- Availability Tracking

---

## Trip Management

Supports the complete trip lifecycle:

Draft
↓

Dispatched
↓

Completed

or

Cancelled

### Business Rules

✅ Vehicle must be Available

✅ Driver must be Available

✅ Cargo Weight ≤ Vehicle Capacity

✅ Driver License must be valid

---

## Maintenance Management

- Create Work Orders
- Track Repair Costs
- Vehicle Shop Status
- Prevent Double Booking

---

## Fuel Management

- Manual Fuel Entries
- Automatic Fuel Logs after Trip Completion
- Fuel Cost Tracking
- Fuel Efficiency Analytics

---

## Expense Management

Track operational expenses including:

- Repairs
- Insurance
- Tolls
- Permits
- Miscellaneous Expenses

---

# 📊 Dashboard

Interactive Dashboard includes

- Fleet Overview
- Vehicle Status
- Active Trips
- Maintenance Summary
- Fuel Consumption
- Expense Analysis
- Fleet Utilization
- ROI Analysis

Charts powered by **Recharts**

---

# 📈 Analytics

## Fuel Efficiency

Fuel Efficiency = Distance Travelled / Fuel Consumed

---

## Fleet Utilization

Fleet Utilization =

Active Vehicles

÷

Total Active Fleet

×100

---

## Vehicle ROI

ROI =

Revenue − Expenses

÷

Purchase Cost

×100

---

# 🏗 Tech Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hook Form
- Zod
- Recharts
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Express Validator
- CORS
- Helmet
- Morgan

---

# 📂 Project Structure

```
TransitOps
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── validations
│   │   └── utils
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/aniketrajput-45/TransitOps.git
```

---

## Backend

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY
```

Run Backend

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🌐 API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login
```

---

## Vehicles

```
GET /api/vehicles

POST /api/vehicles

PUT /api/vehicles/:id

DELETE /api/vehicles/:id
```

---

## Drivers

```
GET /api/drivers

POST /api/drivers

PUT /api/drivers/:id

DELETE /api/drivers/:id
```

---

## Trips

```
GET /api/trips

POST /api/trips

PUT /api/trips/:id

DELETE /api/trips/:id
```

---

## Maintenance

```
GET /api/maintenance

POST /api/maintenance
```

---

## Fuel

```
GET /api/fuel

POST /api/fuel
```

---

## Expenses

```
GET /api/expenses

POST /api/expenses
```

---

# 🔒 Role-Based Access

| Module | Fleet Manager | Dispatch | Driver | Safety | Finance |
|----------|--------------|----------|---------|----------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vehicles | ✅ | 👀 | 👀 | 👀 | 👀 |
| Drivers | ✅ | 👀 | 👀 | 👀 | 👀 |
| Trips | ✅ | ✅ | Assigned Only | 👀 | 👀 |
| Maintenance | ✅ | ❌ | ❌ | 👀 | 👀 |
| Fuel | ✅ | ❌ | ✅ | ❌ | ✅ |
| Expenses | ✅ | ❌ | ❌ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ | 👀 | ✅ |

👀 = Read Only

---

# 🎯 Future Enhancements

- AI-based Vehicle Recommendation
- Predictive Maintenance
- GPS Tracking
- Real-Time Notifications
- PDF Reports
- Email Alerts
- Multi-Organization Support

---

# 👨‍💻 Developed By

**Aniket Kumar Singh**

Hackathon Project – 2026

---

# ⭐ If you like this project

Please consider giving it a ⭐ on GitHub.
