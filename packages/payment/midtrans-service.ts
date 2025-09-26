// packages/payment/midtrans-service.ts
import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';

export class MidtransPaymentService {
  private snap: any;
  private supabase: any;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!
    });

    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createPayment(orderData: {
    items: Array<{ name: string; price: number; quantity: number }>;
    customer: { name: string; email: string; phone: string };
    total: number;
  }) {
    try {
      // Save order to database first
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: order, error } = await this.supabase
        .from('orders')
        .insert([{
          id: orderId,
          customer_name: orderData.customer.name,
          customer_email: orderData.customer.email,
          customer_phone: orderData.customer.phone,
          items: orderData.items,
          total_amount: orderData.total,
          status: 'pending',
          payment_status: 'pending',
          midtrans_order_id: orderId
        }])
        .select()
        .single();

      if (error) throw error;

      // Create Midtrans transaction
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: orderData.total
        },
        customer_details: {
          first_name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone
        },
        item_details: orderData.items.map(item => ({
          id: item.name.toLowerCase().replace(/\s+/g, '-'),
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        callbacks: {
          finish: `${process.env.NEXTAUTH_URL}/order/success`,
          error: `${process.env.NEXTAUTH_URL}/order/error`,
          pending: `${process.env.NEXTAUTH_URL}/order/pending`
        }
      };

      const transaction = await this.snap.createTransaction(parameter);
      
      // Update order with payment URL
      await this.supabase
        .from('orders')
        .update({ payment_url: transaction.redirect_url })
        .eq('id', orderId);

      return {
        payment_url: transaction.redirect_url,
        token: transaction.token,
        order_id: orderId
      };
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any) {
    try {
      // Verify payload signature (implement based on Midtrans docs)
      const orderId = payload.order_id;
      const transactionStatus = payload.transaction_status;
      const fraudStatus = payload.fraud_status;

      let orderStatus = 'pending';
      let paymentStatus = 'pending';

      if (transactionStatus === 'capture') {
        if (fraudStatus === 'accept') {
          orderStatus = 'paid';
          paymentStatus = 'paid';
        }
      } else if (transactionStatus === 'settlement') {
        orderStatus = 'paid';
        paymentStatus = 'paid';
      } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
        orderStatus = 'cancelled';
        paymentStatus = 'failed';
      }

      // Update order in database
      const { error } = await this.supabase
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('midtrans_order_id', orderId);

      if (error) throw error;

      return { success: true, status: orderStatus };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }
}
