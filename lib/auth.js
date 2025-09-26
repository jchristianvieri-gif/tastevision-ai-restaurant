import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple admin authentication (replace with proper auth in production)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@tastevision.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

export const authenticateAdmin = async (email, password) => {
  // Simple check for demo purposes
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign(
      { email, role: 'admin' }, 
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { expiresIn: '24h' }
    );
    
    return { success: true, token };
  }
  
  return { success: false, error: 'Invalid credentials' };
};

export const verifyAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY);
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
};

export const requireAdminAuth = (handler) => {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return handler(req, res);
  };
};
