import { useState, useEffect } from 'react';
import AdminLogin from '../../components/AdminLogin';
import ProductUpload from '../../components/ProductUpload';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('admin_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token verification failed');
    }
    setLoading(false);
  };

  const handleLogin = (token) => {
    setIsAuthenticated(true);
  };

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <ProductUpload />
    </div>
  );
}
