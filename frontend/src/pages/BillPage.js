import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, downloadReceipt } from '../services/api';

const BillPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    transactionId: '',
    amountPaid: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, paymentsRes] = await Promise.all([
          api.get(`/bills/user/${user._id}`),
          api.get(`/payments/user/${user._id}`)
        ]);

        setBills(billsRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error('Error fetching bills and payments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      transactionId: `TXN${Date.now()}`,
      amountPaid: bill.billAmount + (bill.dueAmount || 0)
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post("/payments", {
        billId: selectedBill._id,
        ...paymentData
      });
      // Refresh data
      const [billsRes, paymentsRes] = await Promise.all([
        api.get(`/bills/user/${user._id}`),
        api.get(`/payments/user/${user._id}`)
      ]);

      setBills(billsRes.data);
      setPayments(paymentsRes.data);
      
      setShowPaymentModal(false);
      alert('Payment successful!');
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed');
    }
  };

  const downloadReceiptHandler = async (paymentId) => {
    try {
      await downloadReceipt(paymentId);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  if (loading) {
    return <div className="container"><div className="card">Loading bills...</div></div>;
  }

  return (
    <div className="container">
      <h1>My Bills</h1>
      
      <div className="card">
        <h3>Bill History</h3>
        {bills.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Units Consumed</th>
                <th>Bill Amount (₹)</th>
                <th>Due Amount (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill._id}>
                  <td>{bill.month}</td>
                  <td>{bill.year}</td>
                  <td>{bill.unitsConsumed}</td>
                  <td>{bill.billAmount}</td>
                  <td>{bill.dueAmount || 0}</td>
                  <td>
                    <span className={`status-badge status-${bill.status}`}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {bill.status === 'unpaid' && (
                      <button 
                        className="btn btn-success" 
                        onClick={() => handlePayBill(bill)}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bills available.</p>
        )}
      </div>
      
      <div className="card">
        <h3>Payment History</h3>
        {payments.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Bill Month</th>
                <th>Amount Paid (₹)</th>
                <th>Transaction ID</th>
                <th>Payment Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td>{payment.billId.month} {payment.billId.year}</td>
                  <td>{payment.amountPaid}</td>
                  <td>{payment.transactionId}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => downloadReceiptHandler(payment._id)}
                    >
                      Download Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No payment history available.</p>
        )}
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Pay Bill</h3>
            <p><strong>Bill Amount:</strong> ₹{selectedBill.billAmount}</p>
            <p><strong>Due Amount:</strong> ₹{selectedBill.dueAmount || 0}</p>
            <p><strong>Total Amount:</strong> ₹{selectedBill.billAmount + (selectedBill.dueAmount || 0)}</p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label className="form-label">Transaction ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount to Pay (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({...paymentData, amountPaid: parseFloat(e.target.value)})}
                  required
                  min={selectedBill.billAmount + (selectedBill.dueAmount || 0)}
                />
              </div>
              
              <div className="form-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-success">Confirm Payment</button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPage;