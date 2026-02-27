import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [predictedBill, setPredictedBill] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, historyRes, predictionRes, alertsRes] = await Promise.all([
          api.get(`/bills/user/${user._id}`),
          api.get(`/bills/user/${user._id}/history`),
          api.get(`/bills/user/${user._id}/predict`),
          api.get(`/analytics/user/${user._id}/alerts`)
        ]);

        setBills(billsRes.data);
        setUsageHistory(historyRes.data);
        setPredictedBill(predictionRes.data);
        setAlerts(alertsRes.data.alerts || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Prepare chart data
  const monthlyData = usageHistory.map(bill => ({
    month: `${bill.month} ${bill.year}`,
    units: bill.unitsConsumed,
    billAmount: bill.billAmount
  }));

  const chartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Units Consumed',
        data: monthlyData.map(item => item.units),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Bill Amount (₹)',
        data: monthlyData.map(item => item.billAmount),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        type: 'line',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Usage & Bill Trend',
      },
    },
  };

  if (loading) {
    return <div className="container"><div className="card">Loading dashboard...</div></div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>Welcome, {user.name}</h3>
          <p><strong>EB ID:</strong> {user.ebId}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
        
        <div className="card">
          <h3>Bill Summary</h3>
          <p><strong>Total Bills:</strong> {bills.length}</p>
          <p><strong>Paid Bills:</strong> {bills.filter(b => b.status === 'paid').length}</p>
          <p><strong>Unpaid Bills:</strong> {bills.filter(b => b.status === 'unpaid').length}</p>
        </div>
        
        {predictedBill && (
          <div className="card">
            <h3>Next Month Prediction</h3>
            <p><strong>Predicted Units:</strong> {predictedBill.predictedUnits}</p>
            <p><strong>Predicted Bill:</strong> ₹{predictedBill.predictedBill}</p>
            <p><em>{predictedBill.message}</em></p>
          </div>
        )}
        
        {alerts.length > 0 && (
          <div className="card">
            <h3>Alerts</h3>
            {alerts.map((alert, index) => (
              <div key={index} className="alert alert-warning">
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="card">
        <h3>Usage Trend</h3>
        {monthlyData.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p>No usage data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;