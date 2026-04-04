import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile info state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name,
          email: response.data.email,
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to fetch profile' });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/api/auth/change-password', passwordData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeTab === 'info') {
    return <div className="mt-20 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div className="mx-auto mt-20 max-w-md px-4 sm:px-0">
      <div className="ui-form-card ui-shadow-soft">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-slate-900">Account Settings</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('info');
              setMessage({ type: '', text: '' });
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'info'
                ? 'border-b-2 border-slate-800 text-slate-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setMessage({ type: '', text: '' });
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'password'
                ? 'border-b-2 border-slate-800 text-slate-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Info Tab */}
        {activeTab === 'info' && (
          <form onSubmit={handleProfileSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="ui-input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="ui-input"
              required
            />
            <button type="submit" disabled={loading} className="ui-btn-primary disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="ui-input"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="ui-input"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="ui-input"
              required
            />
            <button type="submit" disabled={loading} className="ui-btn-primary disabled:opacity-50">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
