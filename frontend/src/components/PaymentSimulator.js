import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const PaymentSimulator = () => {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBill, setSelectedBill] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const fetchUserBills = async () => {
        try {
          const response = await api.get(`/bills/user/${selectedUser}`);
          const unpaidBills = response.data.filter(bill => bill.status === 'unpaid');
          setBills(unpaidBills);
          if (unpaidBills.length > 0) {
            // Auto-select the first unpaid bill and set its amount as default
            setSelectedBill(unpaidBills[0]._id);
            setPaymentAmount(unpaidBills[0].billAmount + (unpaidBills[0].dueAmount || 0));
          } else {
            setSelectedBill('');
            setPaymentAmount('');
          }
        } catch (error) {
          console.error('Error fetching user bills:', error);
        }
      };

      fetchUserBills();
    } else {
      setBills([]);
      setSelectedBill('');
      setPaymentAmount('');
    }
  }, [selectedUser]);

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setSelectedBill('');
    setPaymentAmount('');
  };

  const handleBillChange = (e) => {
    const billId = e.target.value;
    setSelectedBill(billId);
    
    // Set payment amount to the total bill amount
    const selectedBillObj = bills.find(bill => bill._id === billId);
    if (selectedBillObj) {
      setPaymentAmount(selectedBillObj.billAmount + (selectedBillObj.dueAmount || 0));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/payments', {
        billId: selectedBill,
        amountPaid: parseFloat(paymentAmount),
        transactionId: transactionId || `SIM_${Date.now()}`
      });

      setMessage('Payment simulation successful!');
      setTransactionId('');
      // Optionally reset the form
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Payment simulation error:', error);
      setMessage(error.response?.data?.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Payment Simulator</h3>
      <p className="text-muted">Simulate payments for testing purposes</p>
      
      {message && (
        <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select User</label>
          <select
            className="form-select"
            value={selectedUser}
            onChange={handleUserChange}
            required
          >
            <option value="">Choose a user</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        
        {selectedUser && (
          <div className="form-group">
            <label className="form-label">Select Unpaid Bill</label>
            <select
              className="form-select"
              value={selectedBill}
              onChange={handleBillChange}
              required
            >
              <option value="">Choose a bill</option>
              {bills.map(bill => (
                <option key={bill._id} value={bill._id}>
                  {bill.month} {bill.year} - ₹{bill.billAmount + (bill.dueAmount || 0)} ({bill.status})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {selectedBill && (
          <div className="form-group">
            <label className="form-label">Payment Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
            <small className="form-hint">Enter the amount to simulate payment</small>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Transaction ID (optional)</label>
          <input
            type="text"
            className="form-input"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Leave blank to auto-generate"
          />
          <small className="form-hint">Will auto-generate if left blank</small>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-success" 
          disabled={loading || !selectedUser || !selectedBill || !paymentAmount}
        >
          {loading ? 'Processing...' : 'Simulate Payment'}
        </button>
      </form>
    </div>
  );
};

export default PaymentSimulator;