import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check for specific admin credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      try {
        // Create admin user if it doesn't exist
        const adminUser = {
          name: 'Administrator',
          email: 'admin@electricity.com',
          password: 'admin123',
          ebId: 'ADMIN001',
          address: 'Admin Office',
          role: 'admin'
        };

        // Try to register admin user
        try {
          await api.post('/users/register', adminUser);
        } catch (registerError) {
          // If user already exists, that's fine
          if (registerError.response?.data?.message !== 'User already exists with this email or EB ID') {
            console.error('Error creating admin user:', registerError);
          }
        }

        // Login with admin credentials
        const response = await api.post('/users/login', {
          email: 'admin@electricity.com',
          password: 'admin123'
        });

        const { token, ...userData } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('admin', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set user data in context
        window.dispatchEvent(new CustomEvent('adminLogin', { detail: userData }));
        
        navigate('/admin-panel');
      } catch (error) {
        console.error('Admin login error:', error);
        setError('Invalid Admin Credentials');
      }
    } else {
      setError('Invalid Admin Credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h2>Admin Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p><strong>Admin Credentials:</strong></p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;