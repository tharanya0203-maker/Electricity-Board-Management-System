import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PaymentSimulator from '../components/PaymentSimulator';

const SubAdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [unitData, setUnitData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    unitsConsumed: '',
    dueAmount: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, billsRes, complaintsRes] = await Promise.all([
          api.get('/users'),
          api.get('/bills'),
          api.get('/complaints')
        ]);

        setUsers(usersRes.data);
        setBills(billsRes.data);
        setComplaints(complaintsRes.data);
      } catch (error) {
        console.error('Error fetching subadmin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'subadmin')) {
      fetchData();
    }
  }, [user]);

  const handleAddUnits = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/bills", {
        userId: selectedUser,
        ...unitData,
        unitsConsumed: parseInt(unitData.unitsConsumed),
        dueAmount: unitData.dueAmount ? parseFloat(unitData.dueAmount) : 0
      });
      alert('Units added successfully!');
      setUnitData({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        unitsConsumed: ''
      });
      setSelectedUser('');
    } catch (error) {
      console.error('Error adding units:', error);
      alert(error.response?.data?.message || 'Failed to add units');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setUnitData({
      ...unitData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="container"><div className="card">Loading sub-admin dashboard...</div></div>;
  }

  return (
    <div className="container">
      <h1>Sub-Admin Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>System Overview</h3>
          <p><strong>Total Users:</strong> {users.length}</p>
          <p><strong>Total Bills:</strong> {bills.length}</p>
          <p><strong>Total Complaints:</strong> {complaints.length}</p>
        </div>
        
        <div className="card">
          <h3>Billing Summary</h3>
          <p><strong>Paid Bills:</strong> {bills.filter(b => b.status === 'paid').length}</p>
          <p><strong>Unpaid Bills:</strong> {bills.filter(b => b.status === 'unpaid').length}</p>
        </div>
      </div>
      
      <div className="card">
        <h3>Add Monthly Units</h3>
        <form onSubmit={handleAddUnits}>
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select
              className="form-input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} (EB ID: {user.ebId})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Month</label>
            <select
              className="form-input"
              name="month"
              value={unitData.month}
              onChange={handleInputChange}
              required
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              className="form-input"
              name="year"
              value={unitData.year}
              onChange={handleInputChange}
              required
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Units Consumed</label>
            <input
              type="number"
              className="form-input"
              name="unitsConsumed"
              value={unitData.unitsConsumed}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional Due Amount (₹) (optional)</label>
            <input
              type="number"
              className="form-input"
              name="dueAmount"
              value={unitData.dueAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Enter extra charges if any"
            />
            <small className="form-hint">Use this to raise additional payment demands</small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || !selectedUser || !unitData.unitsConsumed}
          >
            {submitting ? 'Adding Units...' : 'Add Units'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <h3>Recent Bills</h3>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Month</th>
              <th>Year</th>
              <th>Units</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.slice(0, 10).map(bill => (
              <tr key={bill._id}>
                <td>{bill.userId.name}</td>
                <td>{bill.month}</td>
                <td>{bill.year}</td>
                <td>{bill.unitsConsumed}</td>
                <td>₹{bill.billAmount}</td>
                <td>
                  <span className={`status-badge status-${bill.status}`}>
                    {bill.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <PaymentSimulator />
    </div>
  );
};

export default SubAdminDashboard;