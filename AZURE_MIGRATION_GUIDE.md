# CVera Azure PostgreSQL Migration Guide

## 🚀 Azure PostgreSQL-ə keçid

### 1. Azure PostgreSQL hazırlığı

1. **Azure Portal**-da PostgreSQL Flexible Server yaradın
2. **Database** yaradın (məsələn: `cvera_production`)
3. **Firewall rules** təyin edin (Vercel IP-lərini əlavə edin)
4. **Connection string** əldə edin

### 2. Connection String formatı

```
postgres://username:password@servername.postgres.database.azure.com:5432/databasename?sslmode=require
```

### 3. Migration addımları

#### A. Backup yaradın (təhlükəsizlik üçün)
```bash
npm run db:backup
```

#### B. Environment variables yeniləyin
```bash
# Azure connection string-i əldə etdikdən sonra
AZURE_DATABASE_URL="postgres://your-username:your-password@your-server.postgres.database.azure.com:5432/cvera_db?sslmode=require"

# Migration işlədin
./migrate-to-azure.sh
```

#### C. Əl ilə yeniləmə (alternativ)
1. `.env` faylında `DATABASE_URL` dəyişin
2. `.env.local` faylında `DATABASE_URL` dəyişin
3. `.env.production` faylında `DATABASE_URL` dəyişin

#### D. Migration işlədin
```bash
# Prisma client yenilə
npx prisma generate

# Migrations deploy et
npx prisma migrate deploy

# Database seed et
npm run db:seed

# Connection test et
npm run db:test
```

### 4. Production deployment (Vercel)

#### A. Vercel Environment Variables
1. Vercel Dashboard-a gedin
2. Project > Settings > Environment Variables
3. `vercel-env-variables.txt` faylındakı variables əlavə edin
4. Azure PostgreSQL connection string-i əlavə edin

#### B. Domain konfigurasyonu
1. `cvera.net` domain-i Vercel-ə qoşun
2. SSL sertifikatı avtomatik yaradılacaq
3. LinkedIn OAuth redirect URL-lərini yeniləyin

### 5. Test və verification

```bash
# Local test
npm run dev

# Production build test
npm run build

# Database connection test
./test-azure-connection.sh
```

### 6. Monitoring və maintenance

#### A. Database monitoring
- Azure Portal-da performance metrics yoxlayın
- Connection pool-u monitor edin
- Query performance-u izləyin

#### B. Backup strategiya
```bash
# Günlük backup
npm run db:backup

# Scheduled backup (cron)
0 2 * * * cd /path/to/cvera && npm run db:backup
```

### 7. Troubleshooting

#### A. Connection issues
1. Azure firewall rules yoxlayın
2. SSL sertifikatı yoxlayın
3. Connection string formatı yoxlayın

#### B. Performance issues
1. Database indexes əlavə edin
2. Connection pooling konfiqurasiyasını yoxlayın
3. Query optimization edin

### 8. Rollback planı

Əgər problemlər yaranarsa:
1. Backup-dan restore edin
2. Köhnə Neon connection string-i qaytarın
3. Vercel environment variables-ları əvvəlki vəziyyətə qaytarın

## 🎯 Faydaları

- **Performance**: Azure PostgreSQL daha sürətli
- **Reliability**: Yüksək availability
- **Security**: Enhanced security features
- **Scalability**: Asanlıqla scale edilir
- **Integration**: Azure services ilə inteqrasiya

## 📞 Dəstək

Problemlər yaranarsa:
1. `./test-azure-connection.sh` işlədin
2. Logs yoxlayın
3. Connection string-i verify edin
4. Azure Portal-da metrics yoxlayın
