import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import ServerForm from '../components/ServerForm';

const defaultFormData = {
  name: '',
  host: '',
  port: 22,
  sshUser: '',
  authType: 'password',
  authSecret: '',
  keyName: '',
};

const hostPattern = /^[a-zA-Z0-9.-]+$/;

const ServerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user?.token}` } }),
    [user?.token]
  );

  useEffect(() => {
    const fetchServer = async () => {
      if (!isEditMode) return;
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await axiosInstance.get(`/api/servers/${id}`, authHeaders);
        const server = response.data;
        setFormData({
          name: server.name || '',
          host: server.host || '',
          port: server.port || 22,
          sshUser: server.sshUser || '',
          authType: server.authType || 'password',
          authSecret: server.authSecret || '',
          keyName: server.keyName || '',
        });
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Failed to load server details.');
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [authHeaders, id, isEditMode]);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Server name is required.';
    if (!formData.host.trim()) return 'Host is required.';
    if (!hostPattern.test(formData.host.trim())) return 'Host format is invalid.';
    const port = Number(formData.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return 'Port must be between 1 and 65535.';
    if (!formData.sshUser.trim()) return 'SSH username is required.';
    if (!['password', 'key'].includes(formData.authType)) return 'Auth type is invalid.';
    if (!formData.authSecret.trim()) return 'Auth secret is required.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      host: formData.host.trim(),
      port: Number(formData.port),
      sshUser: formData.sshUser.trim(),
      authSecret: formData.authSecret.trim(),
      keyName: formData.authType === 'key' ? formData.keyName.trim() : '',
    };

    setLoading(true);
    try {
      if (isEditMode) {
        await axiosInstance.put(`/api/servers/${id}`, payload, authHeaders);
      } else {
        await axiosInstance.post('/api/servers', payload, authHeaders);
      }
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-2xl px-4 sm:px-6 lg:px-8">
      <ServerForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
        errorMessage={errorMessage}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default ServerFormPage;

