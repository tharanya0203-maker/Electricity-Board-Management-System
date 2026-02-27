import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Smart Electricity Management System</h1>
        <p className="lead">
          Welcome to the Smart Electricity Management System. This platform helps manage electricity 
          usage, billing, and complaints efficiently.
        </p>
        
        <div className="features">
          <h2>Features:</h2>
          <ul>
            <li>Secure user authentication</li>
            <li>Electricity usage tracking</li>
            <li>Smart bill calculation</li>
            <li>Online payment</li>
            <li>Role-based access control</li>
            <li>Complaint management</li>
            <li>Analytics and bill prediction</li>
            <li>Digital receipt generation</li>
          </ul>
        </div>
        
        <div className="actions">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;