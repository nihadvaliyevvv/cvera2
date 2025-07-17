import epointService from '../src/lib/epoint';

async function testEpointAPI() {
  console.log('🧪 Testing Epoint API Implementation...\n');

  try {
    // Test 1: Heartbeat
    console.log('1. Testing Heartbeat...');
    const heartbeat = await epointService.checkHeartbeat();
    console.log('✅ Heartbeat:', heartbeat);

    // Test 2: Payment Creation
    console.log('\n2. Testing Payment Creation...');
    const payment = await epointService.createPayment({
      amount: 10.00,
      currency: 'AZN',
      orderId: `test_order_${Date.now()}`,
      description: 'Test Payment',
      successRedirectUrl: 'https://cvera.net/payment/success',
      errorRedirectUrl: 'https://cvera.net/payment/error',
      resultUrl: 'https://cvera.net/api/webhooks/epoint',
      customerEmail: 'test@example.com',
      language: 'az'
    });
    console.log('✅ Payment created:', payment);

    // Test 3: Payment Status (with demo transaction)
    if (payment.transactionId) {
      console.log('\n3. Testing Payment Status...');
      const status = await epointService.getPaymentStatus(payment.transactionId);
      console.log('✅ Payment status:', status);
    }

    // Test 4: Card Registration
    console.log('\n4. Testing Card Registration...');
    const cardReg = await epointService.registerCard({
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '25',
      cvv: '123',
      cardholderName: 'Test User',
      customerEmail: 'test@example.com'
    });
    console.log('✅ Card registration:', cardReg);

    // Test 5: Wallet Status
    console.log('\n5. Testing Wallet Status...');
    const walletStatus = await epointService.getWalletStatus();
    console.log('✅ Wallet status:', walletStatus);

    // Test 6: Invoice Creation
    console.log('\n6. Testing Invoice Creation...');
    const invoice = await epointService.createInvoice({
      amount: 25.00,
      currency: 'AZN',
      description: 'Test Invoice',
      customerEmail: 'test@example.com',
      customerName: 'Test Customer',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    console.log('✅ Invoice created:', invoice);

    // Test 7: Widget Token
    console.log('\n7. Testing Widget Token...');
    const widget = await epointService.getPaymentWidget(
      50.00,
      'AZN',
      `widget_test_${Date.now()}`
    );
    console.log('✅ Widget token:', widget);

    // Test 8: Bank Response Messages
    console.log('\n8. Testing Bank Response Messages...');
    const responseCodes = ['000', '100', '116', '200', '300'];
    responseCodes.forEach(code => {
      const message = epointService.getBankResponseMessage(code);
      console.log(`✅ ${code}: ${message}`);
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testEpointAPI();
