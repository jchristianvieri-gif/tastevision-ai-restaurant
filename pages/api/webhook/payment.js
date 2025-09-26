import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Payment webhook received:', JSON.stringify(req.body, null, 2));

  const {
    order_id,
    transaction_status,
    fraud_status,
    gross_amount,
    payment_type,
    transaction_time
  } = req.body;

  try {
    // Update order status based on payment result
    let status = 'pending';
    
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      status = 'paid';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      status = 'failed';
    } else if (transaction_status === 'pending') {
      status = 'pending';
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        payment_status: transaction_status,
        updated_at: new Date().toISOString(),
        payment_data: req.body
      })
      .eq('order_id', order_id)
      .select();

    if (error) {
      console.error('Database update error:', error);
      throw error;
    }

    console.log(`Order ${order_id} updated to status: ${status}`);

    // Send response to Midtrans
    res.status(200).json({ 
      status: 'ok', 
      message: 'Webhook processed successfully',
      order_id: order_id,
      updated_status: status
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error.message 
    });
  }
}
