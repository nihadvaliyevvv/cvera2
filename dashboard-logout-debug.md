## Dashboard Logout Problemi Həlli

### Addım 1: Browser Debug
1. Dashboard səhifəsini açın
2. F12 basın (Developer Tools)
3. Console tab-ına keçin
4. Aşağıdakı kodu yapışdırın və Enter basın:

```javascript
// Auth state-i yoxla
console.log('🔍 Auth state:', localStorage.getItem('accessToken'));
console.log('🔍 Session storage:', sessionStorage);
console.log('🔍 Cookies:', document.cookie);

// Logout funksiyasını manuel çağır
try {
  const logout = async () => {
    console.log('🚪 Manual logout başladı');
    localStorage.clear();
    sessionStorage.clear();
    
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    console.log('✅ Logout API çağrıldı');
    window.location.replace('/');
  };
  
  logout();
} catch (error) {
  console.error('❌ Logout xətası:', error);
}
```

### Addım 2: Force Logout Button
Dashboard-a əlavə logout düyməsi əlavə edək.
