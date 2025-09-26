'use client';
import { useState } from 'react';
import ProductUpload from '@/components/ProductUpload';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setAuthenticated(true);
    } else {
      alert('Password salah');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="p-6 border rounded-lg">
          <h2 className="text-xl mb-4">Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="border p-2 rounded w-full mb-4"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
            Login
          </button>
        </form>
      </div>
    );
  }

  return <ProductUpload />;
}
