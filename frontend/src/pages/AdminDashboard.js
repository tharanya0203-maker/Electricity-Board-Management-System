import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PaymentSimulator from '../components/PaymentSimulator';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, billsRes, complaintsRes, paymentsRes] = await Promise.all([
          api.get('/users'),
          api.get('/bills'),
          api.get('/complaints'),
          api.get('/payments')
        ]);

        setUsers(usersRes.data);
        setBills(billsRes.data);
        setComplaints(complaintsRes.data);
        setAllPayments(paymentsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return <div className="container"><div className="card">Loading admin dashboard...</div></div>;
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>System Overview</h3>
          <p><strong>Total Users:</strong> {users.length}</p>
          <p><strong>Total Bills:</strong> {bills.length}</p>
          <p><strong>Total Payments:</strong> {allPayments.length}</p>
          <p><strong>Total Complaints:</strong> {complaints.length}</p>
        </div>
        
        <div className="card">
          <h3>Billing Summary</h3>
          <p><strong>Total Revenue:</strong> ₹{allPayments.reduce((sum, payment) => sum + payment.amountPaid, 0).toFixed(2)}</p>
          <p><strong>Paid Bills:</strong> {bills.filter(b => b.status === 'paid').length}</p>
          <p><strong>Unpaid Bills:</strong> {bills.filter(b => b.status === 'unpaid').length}</p>
        </div>
        
        <div className="card">
          <h3>Complaint Status</h3>
          <p><strong>Pending:</strong> {complaints.filter(c => c.status === 'Pending').length}</p>
          <p><strong>In Progress:</strong> {complaints.filter(c => c.status === 'In Progress').length}</p>
          <p><strong>Resolved:</strong> {complaints.filter(c => c.status === 'Resolved').length}</p>
        </div>
      </div>
      
      <div className="card">
        <h3>All Users</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>EB ID</th>
              <th>Role</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.ebId}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="card">
        <h3>Recent Complaints</h3>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.slice(0, 5).map(complaint => (
              <tr key={complaint._id}>
                <td>{complaint.userId.name}</td>
                <td>{complaint.title}</td>
                <td>
                  <span className={`status-badge status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {complaint.status}
                  </span>
                </td>
                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <PaymentSimulator />
    </div>
  );
};

export default AdminDashboard;