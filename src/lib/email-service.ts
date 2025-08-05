import nodemailer from 'nodemailer';
import crypto from 'crypto';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'noreply@cvera.net',
        pass: 'ilqarilqar1M@@'
      }
    });
  }

  // Generate secure reset token
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send forgot password email
  async sendForgotPasswordEmail(userEmail: string, userName: string, resetToken: string) {
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://cvera.net'}/auth/reset-password?token=${resetToken}`;

      const emailHTML = `
        <!DOCTYPE html>
        <html lang="az">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Şifrə Yeniləmə - CVERA</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: #f8fafc;
                }
                .container { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 40px; 
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 20px;
                }
                .logo { 
                    font-size: 28px; 
                    font-weight: bold; 
                    color: #2563eb; 
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: #64748b;
                    font-size: 16px;
                }
                .content {
                    margin: 30px 0;
                }
                .button { 
                    display: inline-block; 
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin: 25px 0;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
                    transition: all 0.3s ease;
                }
                .warning { 
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-left: 4px solid #f59e0b; 
                    color: #92400e; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 25px 0;
                }
                .security-note {
                    background: #f1f5f9;
                    border-left: 4px solid #64748b;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-size: 14px;
                    color: #475569;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CVERA</div>
                    <h1 style="color: #1e293b; margin: 20px 0 0 0;">Şifrə Yeniləmə</h1>
                </div>
                
                <div class="content">
                    <p style="font-size: 16px;">Salam <strong>${userName || userEmail}</strong>,</p>
                    
                    <p>CVERA hesabınız üçün şifrə yeniləmə tələbi aldıq. Şifrənizi yeniləmək üçün aşağıdakı linkə klik edin:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" class="button" style="color:white">🔐 Şifrəni Yenilə</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⏰ Vaxt məhdudiyyəti:</strong> Bu link yalnız <strong>1 saat</strong> ərzində etibarlıdır və yalnız bir dəfə istifadə edilə bilər.
                    </div>
                    
                    <div class="security-note">
                        <strong>🛡️ Təhlükəsizlik məlumatı:</strong><br>
                        • Əgər bu tələbi siz etməmisinizsə, bu e-poçtu nəzərə almayın<br>
                        • Şifrənizi heç vaxt başqa şəxslərlə paylaşmayın<br>
                        • Şübhəli fəaliyyət gördükdə dərhal bizə müraciət edin
                    </div>
                    
                    <p>CVERA komandası olaraq hesabınızın təhlükəsizliyini qorumaq bizim əsas prioritetimizdir.</p>
                </div>
                
                <div class="footer">
                    <p><strong>CVERA</strong> - Peşəkar karyeranızın başlanğıcı</p>
                    <p>© 2025 CVERA. Bütün hüquqlar qorunur.</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        Bu e-poçt avtomatik olaraq göndərilmişdir. Bu emailə cavab verməyin.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `;

      const textVersion = `
CVERA - Şifrə Yeniləmə Tələbi

Salam ${userName || userEmail},

CVERA hesabınız üçün şifrə yeniləmə tələbi aldıq.

Şifrənizi yeniləmək üçün bu linkə basın: ${resetLink}

DIQQƏT: Bu link yalnız 1 saat ərzində etibarlıdır.

Əgər bu tələbi siz etməmisinizsə, bu e-poçtu nəzərə almayın.

© 2025 CVERA
Bu e-poçt avtomatik olaraq göndərilmişdir.
      `;

      const mailOptions = {
        from: {
          name: 'CVERA Support',
          address: 'noreply@cvera.net'
        },
        to: userEmail,
        subject: '🔐 CVERA - Şifrə Yeniləmə Tələbi',
        html: emailHTML,
        text: textVersion,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Forgot password email sent to ${userEmail}`);
      console.log(`📧 Message ID: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        resetToken: resetToken
      };

    } catch (error: any) {
      console.error(`❌ Failed to send forgot password email to ${userEmail}:`, error.message);

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send password reset confirmation email
  async sendPasswordResetConfirmation(userEmail: string, userName: string) {
    try {
      const emailHTML = `
        <!DOCTYPE html>
        <html lang="az">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Şifrə Uğurla Yeniləndi - CVERA</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
                .container { background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
                .success-icon { font-size: 48px; color: #10b981; margin: 20px 0; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CVERA</div>
                    <div class="success-icon">✅</div>
                    <h1 style="color: #10b981;">Şifrəniz Uğurla Yeniləndi</h1>
                </div>
                
                <p>Salam <strong>${userName || userEmail}</strong>,</p>
                
                <p>CVERA hesabınızın şifrəsi uğurla yeniləndi. İndi yeni şifrənizlə hesabınıza daxil ola bilərsiniz.</p>
                
                <p>Əgər bu dəyişikliyi siz etməmisinizsə, dərhal bizə müraciət edin.</p>
                
                <div class="footer">
                    <p><strong>CVERA</strong> - Peşəkar karyeranızın başlanğıcı</p>
                    <p>© 2025 CVERA. Bütün hüquqlar qorunur.</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: {
          name: 'CVERA Support',
          address: 'noreply@cvera.net'
        },
        to: userEmail,
        subject: '✅ CVERA - Şifrəniz Uğurla Yeniləndi',
        html: emailHTML
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset confirmation sent to ${userEmail}`);

      return { success: true, messageId: result.messageId };

    } catch (error: any) {
      console.error(`❌ Failed to send confirmation email to ${userEmail}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send email verification for registration
  async sendEmailVerification(userEmail: string, userName: string, verificationToken: string) {
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://cvera.net'}/auth/verify-email?token=${verificationToken}`;

      const emailHTML = `
        <!DOCTYPE html>
        <html lang="az">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Təsdiqi - CVera</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: #f8fafc;
                }
                .container { 
                    background: #ffffff; 
                    border-radius: 12px; 
                    padding: 40px; 
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 20px;
                }
                .logo { 
                    font-size: 28px; 
                    font-weight: bold; 
                    color: #2563eb; 
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: #64748b;
                    font-size: 16px;
                }
                .welcome-icon {
                    font-size: 48px;
                    color: #2563eb;
                    margin: 20px 0;
                }
                .content {
                    margin: 30px 0;
                }
                .button { 
                    display: inline-block; 
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin: 25px 0;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
                    transition: all 0.3s ease;
                }
                .warning { 
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-left: 4px solid #f59e0b; 
                    color: #92400e; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 25px 0;
                }
                .features {
                    background: #f1f5f9;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .feature-item {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                }
                .feature-icon {
                    color: #2563eb;
                    margin-right: 10px;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CVera</div>
                    <div class="subtitle">Peşəkar CV Yaradıcısı</div>
                    <div class="welcome-icon">🎉</div>
                    <h1 style="color: #1e293b; margin: 20px 0 0 0;">Xoş Gəlmisiniz!</h1>
                </div>
                
                <div class="content">
                    <p style="font-size: 16px;">Salam <strong>${userName || userEmail}</strong>,</p>
                    
                    <p>CVera ailəsinə xoş gəlmisiniz! Hesabınızı aktivləşdirmək üçün email ünvanınızı təsdiqləmək lazımdır.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" class="button">✉️ Email Ünvanımı Təsdiqlə</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⏰ Vaxt məhdudiyyəti:</strong> Bu təsdiqləmə linki <strong>24 saat</strong> ərzində etibarlıdır.
                    </div>
                    
                    <div class="features">
                        <h3 style="color: #1e293b; margin-bottom: 15px;">CVera ilə nələr edə bilərsiniz:</h3>
                        <div class="feature-item">
                            <span class="feature-icon">✨</span>
                            <span>Peşəkar CV-lər yaradın</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🔗</span>
                            <span>LinkedIn profilini avtomatik import edin</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">📱</span>
                            <span>Müxtəlif template-lərdən seçim edin</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">📄</span>
                            <span>PDF və DOCX formatında yükləyin</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🤖</span>
                            <span>AI ilə professional xülasə yaradın</span>
                        </div>
                    </div>
                    
                    <p>Email ünvanınızı təsdiqlədikdən sonra dərhal hesabınıza daxil olub peşəkar CV yaratmağa başlaya bilərsiniz!</p>
                    
                    <p style="font-size: 14px; color: #64748b;">
                        Əgər yuxarıdakı düymə işləmirsə, bu linki kopyalayıb brauzerinizə yapışdırın:<br>
                        <code style="background: #f1f5f9; padding: 5px; border-radius: 4px; word-break: break-all;">${verificationLink}</code>
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>CVera</strong> - Peşəkar karyeranızın başlanğıcı</p>
                    <p>© 2025 CVera. Bütün hüquqlar qorunur.</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        Bu email avtomatik olaraq göndərilmişdir. Bu emailə cavab verməyin.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `;

      const textVersion = `
CVera - Email Təsdiqi

Salam ${userName || userEmail},

CVera ailəsinə xoş gəlmisiniz!

Hesabınızı aktivləşdirmək üçün bu linkə basın: ${verificationLink}

DIQQƏT: Bu link 24 saat ərzində etibarlıdır.

CVera ilə:
- Peşəkar CV-lər yaradın
- LinkedIn profilini import edin  
- Müxtəlif template-lərdən istifadə edin
- PDF və DOCX formatında yükləyin

© 2025 CVera
Bu email avtomatik olaraq göndərilmişdir.
      `;

      const mailOptions = {
        from: {
          name: 'CVera Support',
          address: 'noreply@cvera.net'
        },
        to: userEmail,
        subject: '🎉 CVera-ya Xoş Gəlmisiniz - Email Təsdiqi',
        html: emailHTML,
        text: textVersion,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email verification sent to ${userEmail}`);
      console.log(`📧 Message ID: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error: any) {
      console.error(`❌ Failed to send email verification to ${userEmail}:`, error.message);

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send welcome email after successful verification
  async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      const emailHTML = `
        <!DOCTYPE html>
        <html lang="az">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hesab Aktivləşdirildi - CVera</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
                .container { background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
                .success-icon { font-size: 48px; color: #10b981; margin: 20px 0; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 25px 0; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CVera</div>
                    <div class="success-icon">🎊</div>
                    <h1 style="color: #10b981;">Hesabınız Uğurla Aktivləşdirildi!</h1>
                </div>
                
                <p>Salam <strong>${userName || userEmail}</strong>,</p>
                
                <p>Təbriklər! Email ünvanınız uğurla təsdiqləndi və hesabınız aktiv edildi. İndi CVera-nın bütün xüsusiyyətlərindən istifadə edə bilərsiniz.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://cvera.net'}/auth/login" class="cta-button">🚀 İlk CV-mi Yaratmağa Başla</a>
                </div>
                
                <p>Hər hansı sualınız varsa, bizə müraciət etməkdən çəkinməyin.</p>
                
                <div class="footer">
                    <p><strong>CVera</strong> - Peşəkar karyeranızın başlanğıcı</p>
                    <p>© 2025 CVera. Bütün hüquqlar qorunur.</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: {
          name: 'CVera Support',
          address: 'noreply@cvera.net'
        },
        to: userEmail,
        subject: '🎊 Hesabınız Aktivləşdirildi - CVera',
        html: emailHTML
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${userEmail}`);

      return { success: true, messageId: result.messageId };

    } catch (error: any) {
      console.error(`❌ Failed to send welcome email to ${userEmail}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email transporter connection successful');
      return true;
    } catch (error: any) {
      console.error('❌ Email transporter connection failed:', error.message);
      return false;
    }
  }
}
