import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Midtrans signature (simplified)
  const signature = req.headers['x-midtrans-signature'];
  // Add proper verification in production

  const { order_id, transaction_status, gross_amount } = req.body;

  try {
    // Update order status in database
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: transaction_status === 'settlement' ? 'paid' : transaction_status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', order_id);

    if (error) throw error;

    console.log(`Order ${order_id} updated to status: ${transaction_status}`);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
