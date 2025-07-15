import crypto from 'crypto';

interface EpointConfig {
  merchantId: string;
  secretKey: string;
  apiUrl: string;
  webhookSecret: string;
  demoMode: boolean;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

export class EpointService {
  private config: EpointConfig;

  constructor() {
    this.config = {
      merchantId: process.env.EPOINT_MERCHANT_ID || '',
      secretKey: process.env.EPOINT_SECRET_KEY || '',
      apiUrl: process.env.EPOINT_API_URL || '',
      webhookSecret: process.env.EPOINT_WEBHOOK_SECRET || '',
      demoMode: process.env.EPOINT_DEMO_MODE === 'true',
    };
  }

  /**
   * Demo mode üçün fake payment yaradır
   */
  private async createDemoPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Demo mode-da həmişə uğurlu cavab qaytarır
    const demoTransactionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      paymentUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/demo/payment?transactionId=${demoTransactionId}&amount=${request.amount}&orderId=${request.orderId}`,
      transactionId: demoTransactionId,
      message: 'Demo payment created successfully'
    };
  }

  /**
   * Real epoint.az API ilə payment yaradır
   */
  private async createRealPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // epoint.az API-nin real implementation-i
      const signature = this.generateSignature(request);
      
      const payload = {
        merchant_id: this.config.merchantId,
        amount: request.amount,
        currency: request.currency,
        order_id: request.orderId,
        description: request.description,
        success_url: request.successUrl,
        fail_url: request.failUrl,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        signature: signature
      };

      const response = await fetch(`${this.config.apiUrl}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          paymentUrl: data.payment_url,
          transactionId: data.transaction_id,
          message: 'Payment created successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Payment creation failed'
        };
      }
    } catch (error) {
      console.error('Epoint API error:', error);
      return {
        success: false,
        message: 'API connection error'
      };
    }
  }

  /**
   * Payment yaradır (demo və ya real)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (this.config.demoMode) {
      console.log('🧪 Demo mode: Creating fake payment');
      return await this.createDemoPayment(request);
    } else {
      console.log('💰 Live mode: Creating real payment');
      return await this.createRealPayment(request);
    }
  }

  /**
   * Signature yaradır (epoint.az-ın təhlükəsizlik tələbi)
   */
  private generateSignature(request: PaymentRequest): string {
    const data = `${this.config.merchantId}${request.amount}${request.currency}${request.orderId}${this.config.secretKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Webhook signature-ni yoxlayır
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Demo payment status-unu yoxlayır
   */
  async checkPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    status: 'pending' | 'completed' | 'failed';
    amount?: number;
    orderId?: string;
  }> {
    if (this.config.demoMode && transactionId.startsWith('demo_')) {
      // Demo mode-da həmişə completed qaytarır
      return {
        success: true,
        status: 'completed',
        amount: 100, // Demo amount
        orderId: 'demo-order'
      };
    }

    // Real API call would go here
    return {
      success: false,
      status: 'failed'
    };
  }
}

export default new EpointService();
