# Smart Electricity Management System

A comprehensive full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for managing electricity board operations including user authentication, billing, payments, analytics, and complaint management.

## Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Role-based Dashboards**: Admin, Sub-Admin (Meter Reader), and User roles
- **Electricity Billing**: Automatic bill calculation based on consumption slabs
- **Payment Processing**: Online payment simulation with receipt generation
- **Analytics & Prediction**: Monthly usage analytics and bill prediction
- **Complaint Management**: System for raising and tracking complaints
- **PDF Receipts**: Auto-generated receipts after payment
- **Responsive UI**: Mobile-friendly interface built with React

## Tech Stack

- **Frontend**: React.js, React Router, Chart.js for analytics
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **PDF Generation**: PDFKit
- **Styling**: CSS Modules

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd smart-electricity-system/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend root directory with the following:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd smart-electricity-system/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend root directory with the following:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

## Database Schema

The application uses four main collections:

### User Collection
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `ebId`: String (unique)
- `address`: String
- `role`: String (enum: 'admin', 'subadmin', 'user')
- `createdAt`: Date

### Bill Collection
- `_id`: ObjectId
- `userId`: ObjectId (ref: 'User')
- `month`: String
- `year`: Number
- `unitsConsumed`: Number
- `billAmount`: Number
- `dueAmount`: Number
- `status`: String (enum: 'paid', 'unpaid')
- `createdAt`: Date

### Payment Collection
- `_id`: ObjectId
- `userId`: ObjectId (ref: 'User')
- `billId`: ObjectId (ref: 'Bill')
- `amountPaid`: Number
- `transactionId`: String
- `paymentDate`: Date

### Complaint Collection
- `_id`: ObjectId
- `userId`: ObjectId (ref: 'User')
- `title`: String
- `description`: String
- `status`: String (enum: 'Pending', 'In Progress', 'Resolved')
- `response`: String
- `createdAt`: Date

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users` - Get all users (admin only, protected)

### Bill Routes
- `POST /api/bills` - Add monthly units (admin/subadmin only, protected)
- `GET /api/bills` - Get all bills (admin only, protected)
- `GET /api/bills/user/:userId` - Get user bills (protected)
- `PUT /api/bills/:id` - Update bill status (admin only, protected)
- `GET /api/bills/user/:userId/history` - Get usage history (protected)
- `GET /api/bills/user/:userId/predict` - Get predicted bill (protected)

### Payment Routes
- `POST /api/payments` - Make payment (protected)
- `GET /api/payments` - Get all payments (admin only, protected)
- `GET /api/payments/user/:userId` - Get user payments (protected)
- `GET /api/payments/:paymentId/receipt` - Download receipt (protected)

### Complaint Routes
- `POST /api/complaints` - Raise complaint (protected)
- `GET /api/complaints` - Get all complaints (admin only, protected)
- `GET /api/complaints/my` - Get user complaints (protected)
- `GET /api/complaints/:id` - Get complaint by ID (protected)
- `PUT /api/complaints/:id` - Update complaint status (admin only, protected)

### Analytics Routes
- `GET /api/analytics/user/:userId/monthly` - Monthly consumption (protected)
- `GET /api/analytics/user/:userId/comparison` - Consumption comparison (protected)
- `GET /api/analytics/user/:userId/yearly` - Yearly summary (protected)
- `GET /api/analytics/user/:userId/alerts` - High usage alerts (protected)

## Bill Calculation Algorithm

The system uses a slab-based tariff system:
- First 100 units: ₹3 per unit
- 101-200 units: ₹5 per unit
- Above 200 units: ₹7 per unit

## Bill Prediction Algorithm

The system predicts next month's usage by calculating the average of the last 3 months of usage data.

## Deployment

### Backend Deployment (to Render)

1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the build command to `npm install` and start command to `npm start`
4. Add environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key

### Frontend Deployment (to Vercel/Netlify)

#### Option 1: Vercel
1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., https://your-backend.onrender.com/api)

#### Option 2: Netlify
1. Push your code to GitHub
2. Import the project in Netlify
3. Set environment variables in Build & Deploy > Environment:
   - `REACT_APP_API_URL`: Your backend API URL

## Roles & Permissions

- **Admin**: Full access to all features, manage users, bills, payments, complaints
- **Sub-Admin (Meter Reader)**: Update electricity units for assigned users, view consumption records
- **User**: View usage, pay bills, track payment history, raise complaints

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Protected routes
- Input validation
- Rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For any queries regarding this project, feel free to reach out.