import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './utilities/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Smart Electricity Management
      </Link>
      
      <div className="nav-links">
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin Panel</Link>}
            {(user.role === 'admin' || user.role === 'subadmin') && (
              <Link to="/subadmin" className="nav-link">Sub-Admin Panel</Link>
            )}
            
            <Link to="/bills" className="nav-link">Bills</Link>
            <Link to="/payments" className="nav-link">Payments</Link>
            <Link to="/complaints" className="nav-link">Complaints</Link>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/admin-login" className="nav-link">Admin Login</Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;