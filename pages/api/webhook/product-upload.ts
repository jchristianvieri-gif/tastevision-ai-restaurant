// pages/api/webhook/product-upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageUrl, productName, description, price, userId } = req.body;

    // Save to database
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: productName,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
          created_by: userId,
          is_active: true
        }
      ])
      .select();

    if (error) throw error;

    res.status(200).json({ 
      success: true, 
      product: data[0],
      message: 'Product created successfully via n8n workflow' 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
