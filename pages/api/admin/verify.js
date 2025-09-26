import { verifyAdminToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const isValid = verifyAdminToken(token);
    
    if (isValid) {
      res.status(200).json({ valid: true });
    } else {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
}
