# 🚀 TransitOps - Fleet Management & Operational Analytics

A modern, responsive, and secure **Fleet Operations and Analytics Platform** designed to coordinate shipping runs, driver safety standards, vehicle maintenance life-cycles, fuel logs, and general operating expenditures with dynamic, interactive charting and CSV data auditing.

---

## 🌟 Core Features

* **🔐 Advanced Authentication & RBAC**: Real-time permission controls dynamically filtering dashboard access across 5 distinct business roles:
  * **Fleet Manager** (System Admin - full management)
  * **Dispatch Officer** (Logistics planner - schedules and dispatches trips)
  * **Driver** (Operators - restricted to viewing and completing their assigned trips)
  * **Safety Officer** (Compliance coordinator - tracks license alerts and driver safety scores)
  * **Financial Analyst** (Auditor - manages expenses and audits ROI sheets)
* **🚛 Fleet Registries (Vehicles & Drivers)**: Full CRUD operations verifying unique registrations, displaying active warning flags for expired or expiring commercial licenses, and scoring safety standards.
* **🗺️ Trip State Engine**: Automatic state transition lifecycle (`Draft` → `Dispatched` → `Completed`/`Cancelled`) enforcing vehicle load caps, license dates, and asset availability rules.
* **🔧 Repair Shop Workorders**: Places vehicles under active maintenance log (`In Shop`), automatically removing them from dispatch dropdown pools until closed with recorded repair costs.
* **⛽ Cost Tracking Ledger**: Records manual and trip-completed fuel logs, highway tolls, permits, speeding tickets, and commercial insurance.
* **📈 Visual Analytics & Audits**: Renders real-time interactive line, bar, and cost-share pie charts (using Recharts) to analyze vehicle ROI, average fleet efficiencies, and overall utilization rate.
* **📥 CSV Reports Exporter**: One-click formatting and downloading of complete operations data.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS (Vanilla UI tokens), Lucide React (Icons), React Hook Form & Zod (Form schema validation), Recharts (Visual charts).
* **Backend**: Node.js, Express, Express Validator (API params verification), JWT & Bcrypt (Auth sessions).
* **Database**: MongoDB Atlas via Mongoose.

---

## 📁 Repository Structure

```text
transit-ops/
├── backend/                  # Node/Express API Server
│   ├── src/
│   │   ├── config/           # Database configurations
│   │   ├── controllers/      # Route handler controllers (Auth, Vehicles, Trips, etc.)
│   │   ├── middleware/       # JWT auth & role validation middlewares
│   │   ├── models/           # MongoDB schemas (Vehicle, Driver, Trip, etc.)
│   │   ├── routes/           # Protected API route endpoints
│   │   ├── validations/      # Express-validator input checks
│   │   └── scripts/          # Mock database seeding utilities
│   └── package.json
└── frontend/                 # React/Vite Client
    ├── src/
    │   ├── context/          # Auth state provider
    │   ├── layouts/          # Responsive navigation sidebars
    │   ├── pages/            # View pages (Dashboard, Registry CRUDs, Reports, etc.)
    │   ├── routes/           # Guarded React Router paths
    │   └── services/         # Axios API clients
    └── package.json
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) installed locally (v18+ recommended).
* A running MongoDB Atlas database.

### 1. Backend Configuration
Create a `.env` configuration file inside the `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/transitops
JWT_SECRET=your_jwt_signing_token_secret
```

### 2. Install Dependencies
Open a terminal in the root repository directory:
```bash
# Install backend packages
cd transit-ops/backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 3. Seed Database Mock Data
Initialize your database with complete operational data (vehicles, driver warnings, logs, trips, and expenses):
```bash
cd transit-ops/backend
node src/scripts/seed.js
```

### 4. Run Development Servers
Open two terminal windows to boot both dev servers:

**Terminal 1 (Backend API Server):**
```bash
cd transit-ops/backend
npm run dev
# Server boots on http://localhost:5000/
```

**Terminal 2 (Frontend Client Server):**
```bash
cd transit-ops/frontend
npm run dev
# Web application starts on http://localhost:5174/ (or http://localhost:5173/)
```

---

## 🔑 Default Roles & Access Mapping

| Route Page | Fleet Manager (Admin) | Dispatch Officer | Driver | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | Read / Write | Read | Read | Read | Read |
| **Vehicles** | Read / Write | Read | Read | Read | Read |
| **Drivers** | Read / Write | Read | Read | Read | Read |
| **Trip Management** | Read / Write | Read / Write | Read / Write (Assigned Only) | Read | Read |
| **Maintenance** | Read / Write | 🚫 Blocked | 🚫 Blocked | Read | Read |
| **Fuel Logs** | Read / Write | 🚫 Blocked | Read / Write | 🚫 Blocked | Read / Write |
| **Expenses** | Read / Write | 🚫 Blocked | 🚫 Blocked | 🚫 Blocked | Read / Write |
| **Reports** | Read / Write | 🚫 Blocked | 🚫 Blocked | Read | Read / Write |
