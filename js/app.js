// Ana uygulama
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // IndexedDB'den istatistikleri yükle
        await moduleSystem.initializeStatsFromIndexedDB();
        
        // Sayfa yüklendiğinde ana modülleri göster
        moduleSystem.showMainModules();
        
        // Sayfa başlığını güncelle
        document.title = 'Pratik';
        
        // Konsola hoş geldin mesajı
        console.log('DGS Matematik Uygulaması başlatıldı! 🚀');
        console.log('Modül sistemi hazır ve çalışıyor.');
        
        // Kullanıcı istatistiklerini konsola yazdır
        console.log('Kullanıcı İstatistikleri:', moduleSystem.userStats);
    } catch (error) {
        console.error('Uygulama başlatma hatası:', error);
        // Hata durumunda da ana modülleri göster
        moduleSystem.showMainModules();
    }
});

// Klavye kısayolları
document.addEventListener('keydown', function(e) {
    // ESC tuşu ile ana sayfaya dön
    if (e.key === 'Escape') {
        if (moduleSystem.currentSubModule) {
            moduleSystem.showSubModules(moduleSystem.currentModule);
        } else if (moduleSystem.currentModule) {
            moduleSystem.showMainModules();
        }
    }
    
    // "u" tuşu ile Enter tuşu gibi cevap verme
    if (e.key === 'u' || e.key === 'U') {
        const answerInput = document.getElementById('answer-input');
        if (answerInput && answerInput === document.activeElement) {
            // Input aktifse Enter tuşu event'ini tetikle
            const enterEvent = new KeyboardEvent('keypress', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            answerInput.dispatchEvent(enterEvent);
        }
    }
    
    // Enter tuşu ile cevap verme (zaten input'ta tanımlı)
    // Bu kısım modules.js'de handle ediliyor
});

// Sayfa yeniden yüklendiğinde istatistikleri güncelle
window.addEventListener('beforeunload', async function() {
    try {
        await moduleSystem.saveUserStats();
    } catch (error) {
        console.error('İstatistik kaydetme hatası:', error);
    }
});

// PWA desteği için service worker kaydı
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // GitHub Pages için /X/ path'i
        navigator.serviceWorker.register('/X/sw.js', { scope: '/X/' })
            .then(function(registration) {
                console.log('Service Worker başarıyla kaydedildi:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker kaydı başarısız:', error);
            });
    });
}

