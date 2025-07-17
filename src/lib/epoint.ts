import crypto from 'crypto';

interface EpointConfig {
  publicKey: string;
  privateKey: string;
  apiUrl: string;
  webhookSecret: string;
  demoMode: boolean;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  resultUrl?: string;
  customerEmail?: string;
  customerName?: string;
  language?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
  error?: string;
}

interface CardRegistrationRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  customerEmail: string;
}

interface CardRegistrationResponse {
  success: boolean;
  cardToken?: string;
  message?: string;
  error?: string;
}

interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

interface RefundResponse {
  success: boolean;
  refundId?: string;
  message?: string;
  error?: string;
}

interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  orderId: string;
  paymentMethod?: string;
  cardMask?: string;
  processingTime?: string;
  responseCode?: string;
  responseMessage?: string;
}

interface WalletStatusResponse {
  success: boolean;
  wallets?: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    status: string;
  }>;
  message?: string;
  error?: string;
}

interface InvoiceRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName?: string;
  dueDate?: string;
  invoiceNumber?: string;
}

interface InvoiceResponse {
  success: boolean;
  invoiceId?: string;
  invoiceUrl?: string;
  message?: string;
  error?: string;
}

export class EpointService {
  private config: EpointConfig;

  constructor() {
    this.config = {
      publicKey: process.env.EPOINT_MERCHANT_ID || '',
      privateKey: process.env.EPOINT_SECRET_KEY || '',
      apiUrl: process.env.EPOINT_API_URL || 'https://epoint.az/api/1',
      webhookSecret: process.env.EPOINT_WEBHOOK_SECRET || '',
      demoMode: process.env.EPOINT_DEMO_MODE === 'true',
    };
  }

  /**
   * Base64 kodlaşdırma və SHA1 imza yaratmaq
   */
  private generateSignature(data: string): string {
    const signatureData = this.config.privateKey + data + this.config.privateKey;
    const hash = crypto.createHash('sha1').update(signatureData, 'binary').digest('binary');
    return Buffer.from(hash, 'binary').toString('base64');
  }

  /**
   * API sorğusu göndərmək
   */
  private async makeRequest(endpoint: string, requestData: any): Promise<any> {
    const jsonData = JSON.stringify(requestData);
    const data = Buffer.from(jsonData).toString('base64');
    const signature = this.generateSignature(data);

    const payload = {
      data: data,
      signature: signature
    };

    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${responseData.message || 'Unknown error'}`);
    }

    return responseData;
  }

  /**
   * 1. Əsas ödəniş yaratmaq (checkout/payment)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return await this.createDemoPayment(request);
      }

      const requestData = {
        public_key: this.config.publicKey,
        amount: request.amount,
        currency: request.currency,
        language: request.language || 'az',
        order_id: request.orderId,
        description: request.description,
        success_redirect_url: request.successRedirectUrl,
        error_redirect_url: request.errorRedirectUrl,
        result_url: request.resultUrl,
        customer_email: request.customerEmail,
        customer_name: request.customerName
      };

      const response = await this.makeRequest('/checkout', requestData);
      
      return {
        success: true,
        paymentUrl: response.redirect_url,
        transactionId: response.transaction_id,
        message: 'Payment created successfully'
      };
    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  /**
   * 2. Ödəniş statusunu yoxlamaq
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      if (this.config.demoMode) {
        return {
          transactionId,
          status: 'completed',
          amount: 100,
          currency: 'AZN',
          orderId: 'demo-order',
          paymentMethod: 'card',
          cardMask: '****-****-****-1234',
          processingTime: new Date().toISOString(),
          responseCode: '000',
          responseMessage: 'Success'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        transaction_id: transactionId
      };

      const response = await this.makeRequest('/get-status', requestData);
      
      return {
        transactionId: response.transaction_id,
        status: this.mapPaymentStatus(response.status),
        amount: response.amount,
        currency: response.currency,
        orderId: response.order_id,
        paymentMethod: response.payment_method,
        cardMask: response.card_mask,
        processingTime: response.processing_time,
        responseCode: response.response_code,
        responseMessage: response.response_message
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }

  /**
   * 3. Kartı qeydiyyatdan keçirmək
   */
  async registerCard(request: CardRegistrationRequest): Promise<CardRegistrationResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          cardToken: `demo_card_token_${Date.now()}`,
          message: 'Demo card registered successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        card_number: request.cardNumber,
        expiry_month: request.expiryMonth,
        expiry_year: request.expiryYear,
        cvv: request.cvv,
        cardholder_name: request.cardholderName,
        customer_email: request.customerEmail
      };

      const response = await this.makeRequest('/card-registration', requestData);
      
      return {
        success: true,
        cardToken: response.card_token,
        message: 'Card registered successfully'
      };
    } catch (error) {
      console.error('Card registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Card registration failed'
      };
    }
  }

  /**
   * 4. Saxlanmış kartla ödəniş
   */
  async executePayWithCard(cardToken: string, amount: number, currency: string, orderId: string, description: string): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_card_pay_${Date.now()}`,
          message: 'Demo card payment successful'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        card_token: cardToken,
        amount: amount,
        currency: currency,
        order_id: orderId,
        description: description
      };

      const response = await this.makeRequest('/execute-pay', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        message: 'Payment executed successfully'
      };
    } catch (error) {
      console.error('Execute payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment execution failed'
      };
    }
  }

  /**
   * 5. Kartı qeydiyyatdan keçirib həmin anda ödəniş
   */
  async registerCardAndPay(request: CardRegistrationRequest & PaymentRequest): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_register_pay_${Date.now()}`,
          message: 'Demo card registration and payment successful'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        card_number: request.cardNumber,
        expiry_month: request.expiryMonth,
        expiry_year: request.expiryYear,
        cvv: request.cvv,
        cardholder_name: request.cardholderName,
        customer_email: request.customerEmail,
        amount: request.amount,
        currency: request.currency,
        order_id: request.orderId,
        description: request.description
      };

      const response = await this.makeRequest('/card-registration-with-pay', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        message: 'Card registered and payment completed successfully'
      };
    } catch (error) {
      console.error('Card registration and payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Card registration and payment failed'
      };
    }
  }

  /**
   * 6. Refund (Qaytarma)
   */
  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          refundId: `demo_refund_${Date.now()}`,
          message: 'Demo refund processed successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        transaction_id: request.transactionId,
        amount: request.amount,
        reason: request.reason
      };

      const response = await this.makeRequest('/refund-request', requestData);
      
      return {
        success: true,
        refundId: response.refund_id,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }

  /**
   * 7. Əməliyyatı ləğv etmək (Reverse)
   */
  async reversePayment(transactionId: string): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_reverse_${Date.now()}`,
          message: 'Demo reverse processed successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        transaction_id: transactionId
      };

      const response = await this.makeRequest('/reverse', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        message: 'Payment reversed successfully'
      };
    } catch (error) {
      console.error('Reverse error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Reverse failed'
      };
    }
  }

  /**
   * 8. Split Payment (ödəməni bölmək)
   */
  async splitPayment(recipients: Array<{merchantId: string; amount: number; description: string}>, orderId: string): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_split_${Date.now()}`,
          message: 'Demo split payment created successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        order_id: orderId,
        recipients: recipients
      };

      const response = await this.makeRequest('/split-request', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        paymentUrl: response.payment_url,
        message: 'Split payment created successfully'
      };
    } catch (error) {
      console.error('Split payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Split payment failed'
      };
    }
  }

  /**
   * 9. Preauth ödəniş (bloklama)
   */
  async preAuthPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_preauth_${Date.now()}`,
          message: 'Demo preauth payment created successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        amount: request.amount,
        currency: request.currency,
        order_id: request.orderId,
        description: request.description,
        customer_email: request.customerEmail
      };

      const response = await this.makeRequest('/pre-auth-request', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        paymentUrl: response.payment_url,
        message: 'Preauth payment created successfully'
      };
    } catch (error) {
      console.error('Preauth payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Preauth payment failed'
      };
    }
  }

  /**
   * 10. Preauth-u təsdiqləmək
   */
  async completePreAuth(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_preauth_complete_${Date.now()}`,
          message: 'Demo preauth completed successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        transaction_id: transactionId,
        amount: amount
      };

      const response = await this.makeRequest('/pre-auth-complete', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        message: 'Preauth completed successfully'
      };
    } catch (error) {
      console.error('Preauth complete error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Preauth complete failed'
      };
    }
  }

  /**
   * 11. Apple Pay & Google Pay widget token
   */
  async getPaymentWidget(amount: number, currency: string, orderId: string): Promise<{success: boolean; widgetToken?: string; message?: string}> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          widgetToken: `demo_widget_token_${Date.now()}`,
          message: 'Demo widget token created successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        amount: amount,
        currency: currency,
        order_id: orderId
      };

      const response = await this.makeRequest('/token/widget', requestData);
      
      return {
        success: true,
        widgetToken: response.widget_token,
        message: 'Widget token created successfully'
      };
    } catch (error) {
      console.error('Widget token error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Widget token creation failed'
      };
    }
  }

  /**
   * 12. Wallet status (Cüzdan siyahısı)
   */
  async getWalletStatus(): Promise<WalletStatusResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          wallets: [
            {
              id: 'demo_wallet_1',
              name: 'Demo Wallet',
              type: 'main',
              balance: 1000.50,
              currency: 'AZN',
              status: 'active'
            }
          ],
          message: 'Demo wallet status retrieved successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey
      };

      const response = await this.makeRequest('/wallet/status', requestData);
      
      return {
        success: true,
        wallets: response.wallets,
        message: 'Wallet status retrieved successfully'
      };
    } catch (error) {
      console.error('Wallet status error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Wallet status retrieval failed'
      };
    }
  }

  /**
   * 13. Cüzdanla ödəniş
   */
  async payWithWallet(walletId: string, amount: number, currency: string, orderId: string, description: string): Promise<PaymentResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          transactionId: `demo_wallet_pay_${Date.now()}`,
          message: 'Demo wallet payment successful'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        wallet_id: walletId,
        amount: amount,
        currency: currency,
        order_id: orderId,
        description: description
      };

      const response = await this.makeRequest('/wallet/payment', requestData);
      
      return {
        success: true,
        transactionId: response.transaction_id,
        message: 'Wallet payment successful'
      };
    } catch (error) {
      console.error('Wallet payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Wallet payment failed'
      };
    }
  }

  /**
   * 14. Invoice yaratmaq
   */
  async createInvoice(request: InvoiceRequest): Promise<InvoiceResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          invoiceId: `demo_invoice_${Date.now()}`,
          invoiceUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/demo/invoice/${Date.now()}`,
          message: 'Demo invoice created successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        due_date: request.dueDate,
        invoice_number: request.invoiceNumber
      };

      const response = await this.makeRequest('/invoices/create', requestData);
      
      return {
        success: true,
        invoiceId: response.invoice_id,
        invoiceUrl: response.invoice_url,
        message: 'Invoice created successfully'
      };
    } catch (error) {
      console.error('Invoice creation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invoice creation failed'
      };
    }
  }

  /**
   * 15. Invoice yeniləmək
   */
  async updateInvoice(invoiceId: string, updates: Partial<InvoiceRequest>): Promise<InvoiceResponse> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          invoiceId: invoiceId,
          message: 'Demo invoice updated successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        invoice_id: invoiceId,
        ...updates
      };

      const response = await this.makeRequest('/invoices/update', requestData);
      
      return {
        success: true,
        invoiceId: response.invoice_id,
        message: 'Invoice updated successfully'
      };
    } catch (error) {
      console.error('Invoice update error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invoice update failed'
      };
    }
  }

  /**
   * 16. Invoice SMS göndərmək
   */
  async sendInvoiceSMS(invoiceId: string, phoneNumber: string): Promise<{success: boolean; message?: string}> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          message: 'Demo invoice SMS sent successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        invoice_id: invoiceId,
        phone_number: phoneNumber
      };

      const response = await this.makeRequest('/invoices/send-sms', requestData);
      
      return {
        success: true,
        message: 'Invoice SMS sent successfully'
      };
    } catch (error) {
      console.error('Invoice SMS error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invoice SMS sending failed'
      };
    }
  }

  /**
   * 17. Invoice email göndərmək
   */
  async sendInvoiceEmail(invoiceId: string, email: string): Promise<{success: boolean; message?: string}> {
    try {
      if (this.config.demoMode) {
        return {
          success: true,
          message: 'Demo invoice email sent successfully'
        };
      }

      const requestData = {
        public_key: this.config.publicKey,
        invoice_id: invoiceId,
        email: email
      };

      const response = await this.makeRequest('/invoices/send-email', requestData);
      
      return {
        success: true,
        message: 'Invoice email sent successfully'
      };
    } catch (error) {
      console.error('Invoice email error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invoice email sending failed'
      };
    }
  }

  /**
   * 18. Heartbeat (Xidmətin işləkliyini yoxlamaq)
   */
  async checkHeartbeat(): Promise<{success: boolean; status?: string; message?: string}> {
    try {
      const response = await fetch(`${this.config.apiUrl.replace('/api/1', '')}/api/heartbeat`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        status: data.status,
        message: data.message || 'Heartbeat check completed'
      };
    } catch (error) {
      console.error('Heartbeat error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Heartbeat check failed'
      };
    }
  }

  /**
   * Helper functions
   */
  private async createDemoPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const demoTransactionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      paymentUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/demo/payment?transactionId=${demoTransactionId}&amount=${request.amount}&orderId=${request.orderId}`,
      transactionId: demoTransactionId,
      message: 'Demo payment created successfully'
    };
  }

  private mapPaymentStatus(status: string): 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' {
    switch (status) {
      case 'success':
      case 'completed':
        return 'completed';
      case 'failed':
      case 'declined':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
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
   * Demo payment status-unu yoxlayır (köhnə metod - geriyə uyğunluq üçün)
   */
  async checkPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    status: 'pending' | 'completed' | 'failed';
    amount?: number;
    orderId?: string;
  }> {
    if (this.config.demoMode && transactionId.startsWith('demo_')) {
      return {
        success: true,
        status: 'completed',
        amount: 100,
        orderId: 'demo-order'
      };
    }

    try {
      const fullStatus = await this.getPaymentStatus(transactionId);
      const mappedStatus = fullStatus.status === 'cancelled' || fullStatus.status === 'refunded' ? 'failed' : fullStatus.status;
      return {
        success: true,
        status: mappedStatus,
        amount: fullStatus.amount,
        orderId: fullStatus.orderId
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed'
      };
    }
  }

  /**
   * Bank cavab kodlarını tərcümə etmək
   */
  getBankResponseMessage(responseCode: string): string {
    const responses: Record<string, string> = {
      '000': 'Uğurlu ödəniş',
      '100': 'Rədd edildi',
      '116': 'Balans kifayət etmir',
      '117': 'Yanlış PIN',
      '119': 'Əməliyyat limiti aşıldı',
      '120': 'Kart bloklanıb',
      '121': 'Kart vaxtı bitib',
      '122': 'Yanlış kart məlumatları',
      '200': 'Kart götürülməlidir',
      '201': 'Kart oğurlandı',
      '202': 'Kart itib',
      '203': 'Saxta kart',
      '204': 'Kart qəbul edilmir',
      '205': 'Kart məhdudlaşdırılıb',
      '206': 'Kart deaktiv edilib',
      '207': 'Kart müvəqqəti bloklanıb',
      '208': 'Kart daimi bloklanıb',
      '300': 'Format xətası',
      '301': 'Məchul kart',
      '302': 'Məchul əməliyyat',
      '303': 'Məchul merchant',
      '304': 'Təkrar əməliyyat',
      '305': 'Sistem xətası',
      '306': 'Şəbəkə xətası',
      '307': 'Timeout',
      '308': 'Əməliyyat ləğv edildi',
      '309': 'Məlumat bazası xətası',
      '310': 'Konfigürasiya xətası'
    };

    return responses[responseCode] || `Naməlum xəta: ${responseCode}`;
  }
}

const epointService = new EpointService();
export default epointService;
