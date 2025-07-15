const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSubscriptionActivation() {
  try {
    console.log('🔍 Testing subscription activation...');
    
    // Find all users with payments
    const users = await prisma.user.findMany({
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        subscriptions: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      }
    });
    
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Payments (${user.payments.length}):`);
      
      user.payments.forEach((payment, i) => {
        console.log(`   ${i + 1}. ${payment.planType} - ${payment.status} - ${payment.amount} AZN`);
        console.log(`      Transaction: ${payment.transactionId}`);
        console.log(`      Created: ${payment.createdAt}`);
      });
      
      console.log(`   Subscriptions (${user.subscriptions.length}):`);
      user.subscriptions.forEach((sub, i) => {
        console.log(`   ${i + 1}. ${sub.tier} - ${sub.status} - ${sub.provider}`);
        console.log(`      Started: ${sub.startedAt}`);
        console.log(`      Expires: ${sub.expiresAt}`);
      });
    }
    
    // Find completed payments without subscriptions
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'completed'
      },
      include: {
        user: {
          include: {
            subscriptions: {
              where: {
                status: 'active'
              }
            }
          }
        }
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`Total completed payments: ${completedPayments.length}`);
    
    const paymentsWithoutSubscriptions = completedPayments.filter(p => 
      p.user.subscriptions.length === 0
    );
    
    console.log(`Completed payments without active subscriptions: ${paymentsWithoutSubscriptions.length}`);
    
    if (paymentsWithoutSubscriptions.length > 0) {
      console.log(`\n⚠️  Users with completed payments but no active subscriptions:`);
      paymentsWithoutSubscriptions.forEach(payment => {
        console.log(`   ${payment.user.email} - ${payment.planType} - ${payment.transactionId}`);
      });
    }
    
    // Test subscription activation for a specific payment
    if (completedPayments.length > 0) {
      const payment = completedPayments[0];
      console.log(`\n🔧 Testing subscription activation for payment: ${payment.transactionId}`);
      
      // Cancel existing subscriptions
      await prisma.subscription.updateMany({
        where: {
          userId: payment.userId,
          status: 'active'
        },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      });
      
      // Create new subscription
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: payment.userId,
          tier: payment.planType,
          status: 'active',
          provider: 'epoint',
          providerRef: payment.transactionId,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
      
      console.log(`✅ Subscription created: ${newSubscription.id} - ${newSubscription.tier}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscriptionActivation();
