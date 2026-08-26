# College Complaint Management System

A centralized digital platform where college students can register, log in, submit facility grievances, and track their resolution progress across campus administration.

> **Phase 1 — Foundation Release**  
> Focused on student account management, grievance submission with file attachments, complaint lifecycles, and student dashboard tracking with strict data isolation.
>
> 🌐 **Live Unified Deployment (Frontend + Backend)**:  
> **[https://kerry-socks-msie-crawford.trycloudflare.com](https://kerry-socks-msie-crawford.trycloudflare.com)**  
> *(Publicly accessible from any browser with zero passwords or configurations)*

---

## Features (Phase 1)

- **Student Authentication**:
  - Secure student registration with Department and Student ID / Roll Number.
  - Password hashing using `bcryptjs` (salt rounds: 10).
  - JWT (JSON Web Token) authentication with 7-day session validity.
  - Protected API routes and protected client routes.
- **Complaint Submission**:
  - Full grievance intake form with Title, Category, Location, Priority, Description, and File Attachment.
  - **8 Categories**: Classroom, Laboratory, Hostel, Wi-Fi, Infrastructure, Transportation, Cleanliness, Other.
  - **4 Priority Levels**: Low, Medium, High, Critical.
  - Supporting file upload (images or PDF documents up to 5MB) handled via `Multer`.
- **Student Dashboard**:
  - Dynamic KPI summary counters (Total complaints, Pending review, In Progress, Resolved).
  - Real-time search by complaint title or location.
  - Filter by Category and Filter by Status.
  - Responsive grid layout displaying status badges, priorities, and dates.
- **Interactive Resolution Lifecycle Tracker**:
  - Visual 6-stage timeline tracker:
    $$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}$$
  - Step progress indicators, status history timestamps, administrative notes, and resolution summaries.
- **Security & Data Isolation**:
  - Strict ownership enforcement: Students can **only** view and access their own submitted complaints.
  - Cross-student access attempts are rejected with `403 Forbidden`.
  - Unauthenticated requests are rejected with `401 Unauthorized`.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express, Multer, JSON Web Tokens (JWT), bcryptjs |
| **Database** | MongoDB with Mongoose (includes automatic zero-config in-memory fallback) |
| **Architecture** | REST API architecture |

---

## Project Structure

```
College-chatbot/
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection with memory-server fallback
│   │   ├── controllers/        # Auth and Complaint business logic
│   │   │   ├── authController.js
│   │   │   └── complaintController.js
│   │   ├── middleware/         # JWT Auth, Multer, and Error Handling
│   │   │   ├── authMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/             # Mongoose Schemas (User, Complaint)
│   │   │   ├── User.js
│   │   │   └── Complaint.js
│   │   ├── routes/             # Express API routes
│   │   │   ├── authRoutes.js
│   │   │   └── complaintRoutes.js
│   │   └── server.js           # Server entry point
│   ├── uploads/                # File attachments directory
│   ├── test-api.js             # Automated API & security integration test suite
│   ├── .env                    # Environment variables
│   └── package.json
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, StatusBadge, PriorityBadge, StatusTimeline, etc.
│   │   ├── context/            # AuthContext (login, register, session)
│   │   ├── pages/              # Login, Register, Dashboard, NewComplaint, ComplaintDetails
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx             # Route definitions & guards
│   │   └── main.jsx
│   ├── vite.config.js          # Vite config with backend proxy
│   ├── tailwind.config.js
│   └── package.json
├── package.json                # Root orchestration
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v25.9.0)
- **npm** v9+

### 2. Installation
Install all dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables
Copy the configuration template from `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Key environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/college-complaint-db
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*(If a local MongoDB daemon is not detected, an in-memory database automatically initializes for zero-config local development).*

### 4. Running the Application
Start the backend server:
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

Start the frontend development server in a separate terminal:
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register student account | Public |
| `POST` | `/api/auth/login` | Authenticate student & receive JWT | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Private (Bearer JWT) |

### Complaints (`/api/complaints`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/complaints` | Create complaint (supports file upload) | Private (Student) |
| `GET` | `/api/complaints` | Get student's complaints (supports `?category=`, `?status=`, `?search=`) | Private (Student) |
| `GET` | `/api/complaints/:id` | Get details and timeline for a specific complaint | Private (Owner/Admin) |
| `GET` | `/api/health` | API health check status | Public |
