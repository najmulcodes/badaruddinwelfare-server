<!-- PREMIUM HEADER -->

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:0ea5a4&height=200&section=header&text=Badaruddin%20Welfare%20Server%20API&fontSize=40&fontColor=ffffff&animation=fadeIn"/>
</p>

<p align="center">
<b>Backend API for Badar Uddin Bepari Welfare Organization</b><br/>
Secure, scalable backend for managing charity donations, help requests, and member operations.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js"/>
<img src="https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express"/>
<img src="https://img.shields.io/badge/MongoDB-Database-darkgreen?style=for-the-badge&logo=mongodb"/>
<img src="https://img.shields.io/badge/JWT-Authentication-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Render-Deployment-purple?style=for-the-badge&logo=render"/>
</p>

---

# ⚙ Badar Uddin Welfare Server API

This repository contains the **backend server for the Badar Uddin Bepari Welfare Organization platform.**

It provides the **REST API, authentication system, database integration, and file upload functionality** required to run the charity management platform.

The server powers both:

• Public charity website
• Private member management portal

---

# 🌍 Project Purpose

The backend manages the charity’s operations digitally.

It allows the organization to:

• Track member donations
• Manage available charity funds
• Record spending for beneficiaries
• Receive help requests from the public
• Maintain transparency in fund management

---

# 🏗 Backend Architecture

```
badaruddinwelfare-server
│
├── controllers
│
├── routes
│
├── models
│
├── middleware
│
├── config
│
├── utils
│
├── uploads
│
├── server.js
│
└── package.json
```

---

# 🚀 Live API

Production API (Render)

```
https://badaruddinwelfare-api.onrender.com
```
Live Link : https://badaruddinwelfare-server.onrender.com/
---

# 🛠 Tech Stack

### Runtime

Node.js

### Framework

Express.js

### Database

MongoDB Atlas

### Authentication

JWT (JSON Web Token)

### File Upload

Multer
Cloudinary

### Deployment

Render

---

# 🔐 Core Features

## Authentication System

Secure member authentication using **JWT tokens**.

Features:

• Login authentication
• Protected routes
• Token verification middleware

---

## Donation Management

Members can record monthly contributions.

Data fields include:

• Member Name
• Date
• Amount
• Notes

The system automatically calculates:

**Total Donations**

---

## Fund Distribution Tracking

Records when charity funds are used to help someone.

Fields include:

• Recipient Name
• Amount
• Purpose
• Date
• Notes

The system calculates:

**Total Spending**

---

## Fund Balance Calculation

Current fund balance is calculated as:

```
Available Fund = Total Donations - Total Spending
```

---

## Help Request System

Public users can submit assistance requests.

Fields:

• Name
• Phone
• Address
• Description
• Supporting Documents

Requests are stored in the database and reviewed by members.

Status options:

• New
• Under Review
• Approved
• Rejected

---

# 🔒 Security Features

• JWT authentication
• Protected API routes
• Input validation
• File upload restrictions
• Secure environment variables

Unauthorized users cannot access member data.

---

# 📂 API Endpoints Overview

### Authentication

POST /api/auth/login

---

### Donations

GET /api/donations
POST /api/donations

---

### Spending

GET /api/spending
POST /api/spending

---

### Help Requests

GET /api/help-requests
POST /api/help-requests

---

### Contact Messages

POST /api/contact

---

# ⚙ Installation

Clone the repository

```
git clone https://github.com/yourusername/badaruddinwelfare-server.git
```

Navigate to project directory

```
cd badaruddinwelfare-server
```

Install dependencies

```
npm install
```

---

# ▶ Run Development Server

```
npm run dev
```

Server will start on

```
http://localhost:5000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the root directory.

Example:

```
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

# 🚀 Deployment

Backend is deployed using **Render**.

Steps:

1. Push repository to GitHub
2. Connect GitHub repo to Render
3. Set environment variables
4. Deploy server

Production URL example:

```
https://badaruddinwelfare-api.onrender.com
```

---

# 📊 Database (MongoDB)

Collections used:

• users
• donations
• spending
• helpRequests
• contactMessages

---

# 🔗 Related Repository

Frontend Client

```
https://github.com/najmulcodes/badaruddinwelfare-client
```

---

# 👨‍💻 Developer

Developed by

**Najmul Hasan**

Full Stack Developer

GitHub
https://github.com/najmulcodes

Email
[najmulhasanshahin@gmail.com](mailto:najmulhasanshahin@gmail.com)

---

# 📜 License

This project is developed for
**Badar Uddin Bepari Welfare Organization**

All rights reserved.

---

<p align="center">
⭐ If you found this project helpful, consider starring the repository.
</p>

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5a4,100:0f172a&height=120&section=footer"/>
</p>
