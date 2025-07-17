# Epoint.az API Integration - Tam İmplementasiya

CVera layihəsində Epoint.az API-nin tam implementasiyası PDF sənədindən əsasən hazırlanmışdır.

## 🎯 Mövcud Funksiyalar

### 1. Əsas Ödəniş Funksiyaları
- ✅ **Ödəniş yaratmaq** - `createPayment()`
- ✅ **Ödəniş statusu yoxlamaq** - `getPaymentStatus()`
- ✅ **Refund (Qaytarma)** - `refundPayment()`
- ✅ **Əməliyyatı ləğv etmək** - `reversePayment()`

### 2. Kart Ödəniş Funksiyaları
- ✅ **Kartı qeydiyyatdan keçirmək** - `registerCard()`
- ✅ **Saxlanmış kartla ödəniş** - `executePayWithCard()`
- ✅ **Kartı qeydiyyatdan keçirib ödəniş** - `registerCardAndPay()`

### 3. Qabaqcıl Funksiyalar
- ✅ **Split Payment** - `splitPayment()`
- ✅ **Preauth ödəniş** - `preAuthPayment()`
- ✅ **Preauth təsdiqlənməsi** - `completePreAuth()`

### 4. Mobil Ödəniş
- ✅ **Apple Pay & Google Pay** - `getPaymentWidget()`

### 5. Wallet API
- ✅ **Cüzdan statusu** - `getWalletStatus()`
- ✅ **Cüzdanla ödəniş** - `payWithWallet()`

### 6. Invoice Sistemi
- ✅ **Qəbz yaratmaq** - `createInvoice()`
- ✅ **Qəbz yeniləmək** - `updateInvoice()`
- ✅ **Qəbz SMS göndərmək** - `sendInvoiceSMS()`
- ✅ **Qəbz email göndərmək** - `sendInvoiceEmail()`

### 7. Sistem Monitorinqi
- ✅ **Heartbeat** - `checkHeartbeat()`
- ✅ **Bank cavab kodları** - `getBankResponseMessage()`

## 📁 Struktur

```
src/
├── lib/
│   └── epoint.ts                    # Əsas API client
└── app/api/
    ├── payments/
    │   ├── create/route.ts          # Ödəniş yaratmaq
    │   ├── status/route.ts          # Status yoxlamaq
    │   ├── refund/route.ts          # Refund
    │   ├── register-card/route.ts   # Kart qeydiyyatı
    │   ├── wallet/route.ts          # Wallet API
    │   ├── invoice/
    │   │   ├── route.ts            # Invoice CRUD
    │   │   ├── send-sms/route.ts   # SMS göndərmək
    │   │   └── send-email/route.ts # Email göndərmək
    │   └── heartbeat/route.ts       # Sistem statusu
    └── webhooks/
        └── epoint/route.ts          # Webhook handler
```

## 🔧 Konfiqurasiya

### Environment Variables
```bash
# Epoint.az API məlumatları
EPOINT_MERCHANT_ID=your-merchant-id
EPOINT_SECRET_KEY=your-secret-key
EPOINT_API_URL=https://epoint.az/api/1
EPOINT_WEBHOOK_SECRET=your-webhook-secret
EPOINT_DEMO_MODE=false
```

### API Signature Yaratmaq
```javascript
// Base64 + SHA1 signature (Epoint API tələbi)
const data = JSON.stringify(requestData);
const base64Data = Buffer.from(data).toString('base64');
const signatureData = privateKey + base64Data + privateKey;
const signature = crypto.createHash('sha1').update(signatureData, 'binary').digest('base64');
```

## 🚀 İstifadə

### Əsas ödəniş
```javascript
const payment = await epointService.createPayment({
  amount: 25.00,
  currency: 'AZN',
  orderId: 'order_123',
  description: 'CVera Premium abunəlik',
  successRedirectUrl: 'https://cvera.net/payment/success',
  errorRedirectUrl: 'https://cvera.net/payment/error',
  resultUrl: 'https://cvera.net/api/webhooks/epoint',
  customerEmail: 'user@example.com',
  language: 'az'
});
```

### Kart qeydiyyatı
```javascript
const cardReg = await epointService.registerCard({
  cardNumber: '4111111111111111',
  expiryMonth: '12',
  expiryYear: '25',
  cvv: '123',
  cardholderName: 'John Doe',
  customerEmail: 'user@example.com'
});
```

### Refund
```javascript
const refund = await epointService.refundPayment({
  transactionId: 'txn_123',
  amount: 25.00,
  reason: 'Müştəri tələbi'
});
```

### Invoice yaratmaq
```javascript
const invoice = await epointService.createInvoice({
  amount: 100.00,
  currency: 'AZN',
  description: 'Xidmət haqqı',
  customerEmail: 'customer@example.com',
  customerName: 'Customer Name',
  dueDate: '2025-08-15'
});
```

## 🔗 API Endpoints

### Frontend-dən istifadə
```javascript
// Ödəniş yaratmaq
POST /api/payments/create
{
  "tier": "premium",
  "amount": 25.00,
  "saveCard": true,
  "cardToken": "optional_saved_card_token"
}

// Status yoxlamaq
POST /api/payments/status
{
  "transactionId": "txn_123"
}

// Refund
POST /api/payments/refund
{
  "transactionId": "txn_123",
  "amount": 25.00,
  "reason": "Müştəri tələbi"
}

// Kart qeydiyyatı
POST /api/payments/register-card
{
  "cardNumber": "4111111111111111",
  "expiryMonth": "12",
  "expiryYear": "25",
  "cvv": "123",
  "cardholderName": "John Doe"
}

// Wallet statusu
GET /api/payments/wallet

// Wallet ödəniş
POST /api/payments/wallet
{
  "walletId": "wallet_123",
  "amount": 50.00,
  "currency": "AZN",
  "orderId": "order_456",
  "description": "Wallet payment"
}

// Invoice yaratmaq
POST /api/payments/invoice
{
  "amount": 100.00,
  "currency": "AZN",
  "description": "Service fee",
  "customerName": "Customer Name",
  "dueDate": "2025-08-15"
}

// Heartbeat
GET /api/payments/heartbeat
```

## 📱 Webhook Handling

Webhook endpoint: `POST /api/webhooks/epoint`

### Dəstəklənən Events:
- `payment.success` - Ödəniş uğurlu
- `payment.failed` - Ödəniş uğursuz
- `payment.cancelled` - Ödəniş ləğv edildi
- `payment.refunded` - Ödəniş qaytarıldı
- `card.registered` - Kart qeydiyyatdan keçdi
- `preauth.completed` - Preauth tamamlandı
- `invoice.created` - Qəbz yaradıldı
- `invoice.paid` - Qəbz ödəndi
- `wallet.payment.completed` - Wallet ödəniş tamamlandı

## 🏦 Bank Cavab Kodları

```javascript
const message = epointService.getBankResponseMessage('000');
// "Uğurlu ödəniş"

const message = epointService.getBankResponseMessage('116');
// "Balans kifayət etmir"
```

### Əsas kodlar:
- `000` - Uğurlu ödəniş
- `100` - Rədd edildi
- `116` - Balans kifayət etmir
- `200` - Kart götürülməlidir
- `300` - Format xətası

## 🧪 Test

```bash
# Tam API test
node test-epoint-full.js

# Demo mode aktiv etmək
EPOINT_DEMO_MODE=true npm run dev
```

## 📊 Monitoring

```javascript
// Sistem sağlamlığı
const health = await epointService.checkHeartbeat();
console.log(health); // { success: true, status: 'ok' }

// Ödəniş statusu
const status = await epointService.getPaymentStatus('txn_123');
console.log(status.responseCode); // '000'
console.log(epointService.getBankResponseMessage(status.responseCode)); // 'Uğurlu ödəniş'
```

## ⚡ Demo Mode

Development zamanı demo mode aktiv etmək:
```bash
EPOINT_DEMO_MODE=true
```

Demo mode-da:
- Bütün API çağırışları fake cavab qaytarır
- Real bank ilə əlaqə yoxdur
- Test məlumatları istifadə olunur
- Webhook-lar simulate edilir

## 🔒 Təhlükəsizlik

- ✅ Signature verification
- ✅ HMAC SHA-256 webhook validation
- ✅ Base64 + SHA1 request signing
- ✅ Environment variable protection
- ✅ Input validation (Zod)

## 📈 Performance

- ✅ Connection pooling
- ✅ Error handling
- ✅ Retry mechanism
- ✅ Timeout configuration
- ✅ Logging və monitoring

---

**Qeyd**: Bu implementasiya Epoint.az API-nin rəsmi sənədindən əsasən hazırlanmışdır və bütün əsas funksiyaları dəstəkləyir.
