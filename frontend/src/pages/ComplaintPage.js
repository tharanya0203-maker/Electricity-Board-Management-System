import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ComplaintPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints/my');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/complaints', newComplaint);
      setComplaints([response.data, ...complaints]);
      setNewComplaint({ title: '', description: '' });
      alert('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setNewComplaint({
      ...newComplaint,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="container"><div className="card">Loading complaints...</div></div>;
  }

  return (
    <div className="container">
      <h1>Complaints</h1>
      
      <div className="card">
        <h3>Raise New Complaint</h3>
        <form onSubmit={handleSubmitComplaint}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={newComplaint.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={newComplaint.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <h3>My Complaints</h3>
        {complaints.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint._id}>
                  <td>{complaint.title}</td>
                  <td>{complaint.description}</td>
                  <td>
                    <span className={`status-badge status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>{complaint.response || 'No response yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No complaints found.</p>
        )}
      </div>
    </div>
  );
};

export default ComplaintPage;