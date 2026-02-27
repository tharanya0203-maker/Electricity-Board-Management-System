# 🚀 Smart Electricity Management System - Running Instructions

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager)
- **MongoDB** (either local installation or MongoDB Atlas account)

## 🛠️ Installation & Setup

### Step 1: Install Backend Dependencies

```bash
cd ~/sound\ qoder/smart-electricity-system/backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd ~/sound\ qoder/smart-electricity-system/frontend
npm install
```

### Step 3: Configure Backend Environment

Create a `.env` file in the backend directory:

```bash
cd ~/sound\ qoder/smart-electricity-system/backend
nano .env
```

Add the following configuration:

```env
# For Local MongoDB:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electricity_management
JWT_SECRET=your_very_secure_secret_key_here_change_this

# For MongoDB Atlas (Alternative):
# NODE_ENV=development
# PORT=5000
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/electricity_management
# JWT_SECRET=your_very_secure_secret_key_here_change_this
```

**Important**: Change the `JWT_SECRET` to a secure random string!

### Step 4: Configure Frontend Environment

Create a `.env` file in the frontend directory:

```bash
cd ~/sound\ qoder/smart-electricity-system/frontend
nano .env
```

Add the following configuration:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## ▶️ Running the Application

### Method 1: Using Separate Terminals (Recommended)

**Terminal 1 - Start Backend Server:**
```bash
cd ~/sound\ qoder/smart-electricity-system/backend
npm run dev
```

**Terminal 2 - Start Frontend Server:**
```bash
cd ~/sound\ qoder/smart-electricity-system/frontend
npm start
```

### Method 2: Using Background Processes

**Start Backend:**
```bash
cd ~/sound\ qoder/smart-electricity-system/backend
npm run dev &
```

**Start Frontend:**
```bash
cd ~/sound\ qoder/smart-electricity-system/frontend
npm start &
```

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend Application**: Open your browser and navigate to `http://localhost:3000`
- **Backend API**: Available at `http://localhost:5000/api`

## 📊 MongoDB Setup Options

### Option 1: Local MongoDB Installation

1. **Install MongoDB** (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mongodb
```

2. **Start MongoDB service**:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

3. **Verify MongoDB is running**:
```bash
sudo systemctl status mongod
```

### Option 2: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Use the connection string in your `.env` file

## 🔐 User Registration & Login

1. Open `http://localhost:3000` in your browser
2. Click on "Register" to create a new account
3. Fill in the required information:
   - Full Name
   - Email
   - Password
   - EB ID (Electricity Board ID)
   - Address
4. After registration, you'll be automatically logged in
5. By default, the first user will have 'user' role
6. For admin access, you'll need to manually update the user's role in the database

## 🧪 Testing the Application

### Sample Test Data:
- **User Role**: Regular user for bill viewing and payment
- **Admin Role**: Full access to all system features
- **Sub-Admin Role**: Meter reader functionality

### Test Scenarios:
1. **User Registration**: Create a new user account
2. **Login**: Test login functionality
3. **Dashboard**: View user dashboard with analytics
4. **Bill Management**: View bills and make payments
5. **Complaint System**: Raise and track complaints
6. **Admin Panel**: (If you have admin access) Manage users and bills

## 🛠️ Troubleshooting Common Issues

### Issue 1: "Connection Refused" or Database Connection Error
**Solution**: 
- Ensure MongoDB is running
- Check your `.env` file for correct `MONGODB_URI`
- Verify MongoDB service status: `sudo systemctl status mongod`

### Issue 2: "Port Already in Use"
**Solution**:
- Kill existing processes: `sudo lsof -i :5000` or `sudo lsof -i :3000`
- Then kill the process: `sudo kill -9 [PID]`

### Issue 3: "Module Not Found" Errors
**Solution**:
- Navigate to backend directory and run: `npm install`
- Navigate to frontend directory and run: `npm install`

### Issue 4: Frontend Not Loading
**Solution**:
- Check if the backend server is running on port 5000
- Verify the `REACT_APP_API_URL` in frontend `.env` file
- Check browser console for errors (F12)

### Issue 5: Registration/Login Not Working
**Solution**:
- Check backend terminal for database connection errors
- Verify MongoDB is accessible
- Check if required environment variables are set

## 📁 Project Structure

```
smart-electricity-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── .env            # Environment variables
│   └── server.js       # Main server file
├── frontend/
│   ├── public/         # Static files
│   ├── src/            # React source code
│   │   ├── components/ # React components
│   │   ├── context/    # React context
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── App.js      # Main App component
│   ├── .env           # Environment variables
│   └── package.json
└── README.md
```

## 🔧 Development Commands

### Backend Development:
```bash
cd backend
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests (if configured)
```

### Frontend Development:
```bash
cd frontend
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🚀 Production Deployment

For production deployment, see the main `README.md` file for deployment instructions to:
- Render (backend)
- Vercel/Netlify (frontend)
- MongoDB Atlas (database)

## 🆘 Need Help?

If you encounter any issues:
1. Check the terminal outputs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that both backend and frontend servers are running
5. Look at browser console for frontend errors (F12)

## 📞 Support

For any questions or issues with the setup, please check the main documentation in `README.md` or open an issue if you're using a repository.