import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="ui-form-card ui-shadow-soft">
        <h1 className="mb-5 text-center text-2xl font-semibold tracking-tight text-slate-900">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="ui-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="ui-input"
        />
        <button type="submit" className="ui-btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
