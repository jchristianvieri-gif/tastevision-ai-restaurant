// lib/midtrans.ts
import midtransClient from 'midtrans-client';

export class PaymentService {
  private snap: any;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    });
  }

  async createTransaction(orderDetails: {
    order_id: string;
    gross_amount: number;
    items: Array<{ id: string; price: number; quantity: number; name: string }>;
    customer_details: { first_name: string; email: string; phone: string };
  }) {
    try {
      const parameter = {
        transaction_details: {
          order_id: orderDetails.order_id,
          gross_amount: orderDetails.gross_amount,
        },
        item_details: orderDetails.items,
        customer_details: orderDetails.customer_details,
        callbacks: {
          finish: `${process.env.NEXTAUTH_URL}/order/success`,
          error: `${process.env.NEXTAUTH_URL}/order/error`,
          pending: `${process.env.NEXTAUTH_URL}/order/pending`,
        },
      };

      const transaction = await this.snap.createTransaction(parameter);
      return transaction;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  async handlePaymentNotification(payload: any) {
    // Handle payment status update via n8n webhook
    const response = await fetch(`${process.env.N8N_URL}/webhook/payment-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  }
}
