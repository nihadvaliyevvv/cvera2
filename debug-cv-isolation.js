const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCVIsolation() {
  try {
    console.log('🔍 Debugging CV isolation issue...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        linkedinId: true,
        _count: {
          select: {
            cvs: true
          }
        }
      }
    });

    console.log('👥 All users in database:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user._count.cvs} CVs`);
      console.log(`    ID: ${user.id}`);
      if (user.linkedinId) {
        console.log(`    LinkedIn ID: ${user.linkedinId}`);
      }
      console.log('');
    });

    // Get all CVs with user info
    const cvs = await prisma.cV.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📄 All CVs in database:');
    cvs.forEach(cv => {
      console.log(`  - "${cv.title}" by ${cv.user.name} (${cv.user.email})`);
      console.log(`    CV ID: ${cv.id}`);
      console.log(`    User ID: ${cv.userId}`);
      console.log(`    Created: ${cv.createdAt}`);
      console.log('');
    });

    // Check for duplicate users with same email
    const emailGroups = users.reduce((acc, user) => {
      if (!acc[user.email]) acc[user.email] = [];
      acc[user.email].push(user);
      return acc;
    }, {});

    const duplicateEmails = Object.entries(emailGroups).filter(([_, users]) => users.length > 1);
    
    if (duplicateEmails.length > 0) {
      console.log('🚨 DUPLICATE EMAILS FOUND:');
      duplicateEmails.forEach(([email, users]) => {
        console.log(`  Email: ${email}`);
        users.forEach(user => {
          console.log(`    - User ID: ${user.id}, Name: ${user.name}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ No duplicate emails found');
    }

    // Check for orphaned CVs
    const orphanedCVs = await prisma.cV.findMany({
      where: {
        user: null
      }
    });

    if (orphanedCVs.length > 0) {
      console.log('🚨 ORPHANED CVs FOUND:');
      orphanedCVs.forEach(cv => {
        console.log(`  - CV ID: ${cv.id}, Title: ${cv.title}, User ID: ${cv.userId}`);
      });
    } else {
      console.log('✅ No orphaned CVs found');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCVIsolation();
