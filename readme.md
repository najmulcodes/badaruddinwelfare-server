<!-- PREMIUM HEADER -->

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:0ea5a4&height=200&section=header&text=Badaruddin%20Welfare%20Server%20API&fontSize=40&fontColor=ffffff&animation=fadeIn"/>
</p>

<p align="center">
<b>Backend API for Badar Uddin Bepari Welfare Organization</b><br/>
Secure REST API powering the charity management platform.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js"/>
<img src="https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express"/>
<img src="https://img.shields.io/badge/MongoDB-Database-darkgreen?style=for-the-badge&logo=mongodb"/>
<img src="https://img.shields.io/badge/JWT-Authentication-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Render-Deployment-purple?style=for-the-badge&logo=render"/>
</p>

---

# ⚙ Badaruddin Welfare Server API

This repository contains the **backend server for the Badar Uddin Bepari Welfare Organization platform.**

The server handles:

• Authentication and authorization  
• Donation management  
• Help request processing  
• Spending records  
• Contact messages  
• File uploads

It powers both:

• Public charity website  
• Private member dashboard

---

# 🌍 Project Purpose

The backend digitizes charity operations and helps maintain **transparency and accountability**.

The system allows the organization to:

• Track member donations  
• Manage available charity funds  
• Record spending for beneficiaries  
• Receive help requests from the public  
• Maintain transparent financial records

---

# 🚀 Live API

Production API


https://badaruddinwelfare-server.onrender.com


Example endpoint


https://badaruddinwelfare-server.onrender.com/api/donations


---

# 🏗 Backend Architecture


badaruddinwelfare-server
│
├── controllers
├── routes
├── models
├── middleware
├── config
├── utils
├── uploads
│
├── server.js
└── package.json


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

Secure authentication using **JWT tokens**.

Features:

• Login authentication  
• Token verification middleware  
• Protected API routes  

---

## Donation Management

Members can record monthly contributions.

Fields stored:

• Member Name  
• Date  
• Amount  
• Notes  

The system calculates:


Total Donations


---

## Spending Management

Records charity spending when funds are used.

Fields:

• Recipient Name  
• Amount  
• Purpose  
• Date  
• Notes  

The system calculates:


Total Spending


---

## Fund Balance Calculation

Available funds are calculated automatically.


Available Fund = Total Donations - Total Spending


---

## Help Request System

Public users can submit assistance requests.

Fields:

• Name  
• Phone  
• Address  
• Description  
• Supporting documents

Request statuses:

• New  
• Under Review  
• Approved  
• Rejected

Members review and approve requests through the dashboard.

---

# 🔒 Security Features

• JWT authentication  
• Protected routes middleware  
• Input validation  
• File upload restrictions  
• Secure environment variables

Unauthorized users cannot access protected endpoints.

---

# 📂 API Endpoints

## Authentication

Login user


POST /api/auth/login


Example request

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
Donations

Get donation records

GET /api/donations

Add donation record

POST /api/donations
Spending

Get spending records

GET /api/spending

Add spending record

POST /api/spending
Help Requests

Submit help request

POST /api/help-requests

Get requests

GET /api/help-requests

Update request status

PATCH /api/help-requests/:id/status
Contact Messages

Submit contact form message

POST /api/contact
⚙ Installation

Clone the repository

git clone https://github.com/najmulcodes/badaruddinwelfare-server.git

Navigate to project directory

cd badaruddinwelfare-server

Install dependencies

npm install
▶ Run Development Server
npm run dev

Server will start on

http://localhost:5000
🔐 Environment Variables

Create .env file inside root directory.

Example:

PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
🚀 Deployment

Backend is deployed using Render.

Deployment steps:

Push repository to GitHub

Connect repository to Render

Configure environment variables

Deploy server

📊 Database Collections

MongoDB collections used:

• users
• donations
• spending
• helpRequests
• contactMessages

🔗 Related Repository

Frontend client

https://github.com/najmulcodes/badaruddinwelfare-client

👨‍💻 Developer

Developed by

Najmul Hasan

Full Stack Developer
Dhaka, Bangladesh

GitHub
https://github.com/najmulcodes

Email
najmulhasanshahin@gmail.com

📜 License

This project was created for

Badar Uddin Bepari Welfare Organization

All rights reserved.

<p align="center"> ⭐ If you found this project helpful, consider starring the repository. </p> <p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5a4,100:0f172a&height=120&section=footer"/> </p> ```