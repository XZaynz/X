// Modül sistemi
class ModuleSystem {
    constructor() {
        this.currentModule = null;
        this.currentSubModule = null;
        this.userStats = {
            totalQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            questionHistory: {},
            difficultQuestions: [],
            moduleStats: {},
            exerciseStats: {}
        };
        // İstatistikleri senkron olarak yükle (localStorage'dan)
        this.loadUserStatsSync();
    }

    // İstatistikleri senkron olarak yükle (localStorage'dan)
    loadUserStatsSync() {
        try {
            const savedStats = localStorage.getItem('userStats');
            if (savedStats) {
                this.userStats = JSON.parse(savedStats);
                console.log('İstatistikler localStorage\'dan yüklendi:', this.userStats);
            }
        } catch (error) {
            console.error('localStorage yükleme hatası:', error);
        }
    }

    // İstatistikleri IndexedDB'den yükle (asenkron)
    async initializeStatsFromIndexedDB() {
        try {
            const savedStats = await this.loadUserStats();
            if (savedStats) {
                this.userStats = savedStats;
                console.log('İstatistikler IndexedDB\'den yüklendi:', this.userStats);
            }
        } catch (error) {
            console.error('IndexedDB yükleme hatası:', error);
        }
    }

    // Kullanıcı istatistiklerini IndexedDB'den yükle
    async loadUserStats() {
        try {
            const savedStats = await dbManager.getUserStats();
            if (savedStats) {
                // Gereksiz alanları temizle
                delete savedStats.id;
                delete savedStats.lastUpdated;
                return savedStats;
            }
        } catch (error) {
            console.error('IndexedDB yükleme hatası:', error);
        }
        
        // Fallback: localStorage kullan veya varsayılan değerler
        const stats = localStorage.getItem('userStats');
        return stats ? JSON.parse(stats) : {
            totalQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            questionHistory: {},
            difficultQuestions: [],
            moduleStats: {},
            exerciseStats: {}
        };
    }

    // Kullanıcı istatistiklerini IndexedDB'ye kaydet
    async saveUserStats() {
        try {
            await dbManager.saveUserStats(this.userStats);
            console.log('Kullanıcı istatistikleri IndexedDB\'ye kaydedildi');
        } catch (error) {
            console.error('IndexedDB kaydetme hatası:', error);
            // Fallback: localStorage kullan
            localStorage.setItem('userStats', JSON.stringify(this.userStats));
        }
    }

    // Ana sayfa modüllerini göster
    showMainModules() {
        const mainContent = document.getElementById('main-content');
        
        // Her modül için doğruluk yüzdesini hesapla
        const toplamaAccuracy = this.getModuleAccuracyAdvanced('toplama');
        const cikarmaAccuracy = this.getModuleAccuracyAdvanced('cikarma');
        const carpmaAccuracy = this.getModuleAccuracyAdvanced('carpma');
        const usluAccuracy = this.getModuleAccuracyAdvanced('uslu');
        const faktoriyelAccuracy = this.getModuleAccuracyAdvanced('faktoriyel');
        const kesirlerAccuracy = this.getModuleAccuracyAdvanced('kesirler');
        
        mainContent.innerHTML = `
            <div class="module-grid">
                <div class="module-card" onclick="moduleSystem.showSubModules('toplama')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(toplamaAccuracy)}">${toplamaAccuracy}%</div>
                    <h3>Toplama</h3>
                    <p>Toplama işlemleri ile matematik becerilerinizi geliştirin</p>
                </div>
                <div class="module-card" onclick="moduleSystem.showSubModules('cikarma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(cikarmaAccuracy)}">${cikarmaAccuracy}%</div>
                    <h3>Çıkarma</h3>
                    <p>Çıkarma işlemleri ile matematik becerilerinizi geliştirin</p>
                </div>
                <div class="module-card" onclick="moduleSystem.showSubModules('carpma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(carpmaAccuracy)}">${carpmaAccuracy}%</div>
                    <h3>Çarpma</h3>
                    <p>Çarpma işlemleri ile matematik becerilerinizi geliştirin</p>
                </div>
                <div class="module-card" onclick="moduleSystem.showSubModules('uslu')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(usluAccuracy)}">${usluAccuracy}%</div>
                    <h3>Üslü Sayılar</h3>
                    <p>Üslü sayılar ile matematik becerilerinizi geliştirin</p>
                </div>
                <div class="module-card" onclick="moduleSystem.showSubModules('faktoriyel')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(faktoriyelAccuracy)}">${faktoriyelAccuracy}%</div>
                    <h3>Faktöriyel</h3>
                    <p>Faktöriyel hesaplamaları ile matematik becerilerinizi geliştirin</p>
                </div>
                <div class="module-card" onclick="moduleSystem.showSubModules('kesirler')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(kesirlerAccuracy)}">${kesirlerAccuracy}%</div>
                    <h3>Kesirler</h3>
                    <p>Kesirli ifadeler ve yüzde hesaplamaları ile matematik becerilerinizi geliştirin</p>
                </div>
            </div>
            <div class="stats">
                <h3>İstatistikleriniz</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${this.userStats.totalQuestions}</div>
                        <div class="stat-label">Toplam Soru</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.userStats.correctAnswers}</div>
                        <div class="stat-label">Doğru Cevap</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.userStats.incorrectAnswers}</div>
                        <div class="stat-label">Yanlış Cevap</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.userStats.totalQuestions > 0 ? Math.round((this.userStats.correctAnswers / this.userStats.totalQuestions) * 100) : 0}%</div>
                        <div class="stat-label">Başarı Oranı</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="reset-button" onclick="moduleSystem.resetAllStats()">Tüm İstatistikleri Sıfırla</button>
                </div>
            </div>
        `;
        this.currentModule = null;
        this.currentSubModule = null;
    }

    // Alt modülleri göster
    showSubModules(moduleType) {
        this.currentModule = moduleType;
        this.currentSubModule = null; // Alt modül sayfasından çıkarken sıfırla
        const mainContent = document.getElementById('main-content');
        
        let subModules = '';
        
        if (moduleType === 'toplama') {
            const birBasamakliToplamaAccuracy = this.getExerciseAccuracy('birBasamakliToplama');
            const ikiArtıBirBasamakliToplamaAccuracy = this.getExerciseAccuracy('ikiArtıBirBasamakliToplama');
            const ucArtıBirBasamakliToplamaAccuracy = this.getExerciseAccuracy('ucArtıBirBasamakliToplama');
            const ikiArtıIkiBasamakliToplamaAccuracy = this.getExerciseAccuracy('ikiArtıIkiBasamakliToplama');
            const ileriMatematikAccuracy = this.getIleriMatematikAverageAccuracy('toplama');
            
            subModules = `
                <div class="sub-module" onclick="moduleSystem.startExercise('birBasamakliToplama')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(birBasamakliToplamaAccuracy)}">${birBasamakliToplamaAccuracy}%</div>
                    <h4>Bir + Bir Basamaklı Toplama</h4>
                    <p>Bir basamaklı + bir basamaklı sayıları toplama alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiArtıBirBasamakliToplama')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiArtıBirBasamakliToplamaAccuracy)}">${ikiArtıBirBasamakliToplamaAccuracy}%</div>
                    <h4>İki + Bir Basamaklı Toplama</h4>
                    <p>İki basamaklı + bir basamaklı sayıları toplama alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ucArtıBirBasamakliToplama')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ucArtıBirBasamakliToplamaAccuracy)}">${ucArtıBirBasamakliToplamaAccuracy}%</div>
                    <h4>Üç + Bir Basamaklı Toplama</h4>
                    <p>Üç basamaklı + bir basamaklı sayıları toplama alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiArtıIkiBasamakliToplama')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiArtıIkiBasamakliToplamaAccuracy)}">${ikiArtıIkiBasamakliToplamaAccuracy}%</div>
                    <h4>İki + İki Basamaklı Toplama</h4>
                    <p>İki basamaklı + iki basamaklı sayıları toplama alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.showIleriMatematik()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ileriMatematikAccuracy)}">${ileriMatematikAccuracy}%</div>
                    <h4>İleri Matematik</h4>
                    <p>Seçtiğiniz sayı ile sürekli toplama alıştırması</p>
                </div>
            `;
        } else if (moduleType === 'cikarma') {
            const birBasamakliCikarmaAccuracy = this.getExerciseAccuracy('birBasamakliCikarma');
            const ikiArtıBirBasamakliCikarmaAccuracy = this.getExerciseAccuracy('ikiArtıBirBasamakliCikarma');
            const ucArtıBirBasamakliCikarmaAccuracy = this.getExerciseAccuracy('ucArtıBirBasamakliCikarma');
            const ikiArtıIkiBasamakliCikarmaAccuracy = this.getExerciseAccuracy('ikiArtıIkiBasamakliCikarma');
            const ileriMatematikCikarmaAccuracy = this.getIleriMatematikAverageAccuracy('cikarma');
            
            subModules = `
                <div class="sub-module" onclick="moduleSystem.startExercise('birBasamakliCikarma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(birBasamakliCikarmaAccuracy)}">${birBasamakliCikarmaAccuracy}%</div>
                    <h4>Bir - Bir Basamaklı Çıkarma</h4>
                    <p>Bir basamaklı - bir basamaklı sayıları çıkarma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiArtıBirBasamakliCikarma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiArtıBirBasamakliCikarmaAccuracy)}">${ikiArtıBirBasamakliCikarmaAccuracy}%</div>
                    <h4>İki - Bir Basamaklı Çıkarma</h4>
                    <p>İki basamaklı - bir basamaklı sayıları çıkarma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ucArtıBirBasamakliCikarma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ucArtıBirBasamakliCikarmaAccuracy)}">${ucArtıBirBasamakliCikarmaAccuracy}%</div>
                    <h4>Üç - Bir Basamaklı Çıkarma</h4>
                    <p>Üç basamaklı - bir basamaklı sayıları çıkarma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiArtıIkiBasamakliCikarma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiArtıIkiBasamakliCikarmaAccuracy)}">${ikiArtıIkiBasamakliCikarmaAccuracy}%</div>
                    <h4>İki - İki Basamaklı Çıkarma</h4>
                    <p>İki basamaklı - iki basamaklı sayıları çıkarma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.showIleriMatematikCikarma()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ileriMatematikCikarmaAccuracy)}">${ileriMatematikCikarmaAccuracy}%</div>
                    <h4>İleri Matematik Çıkarma</h4>
                    <p>Seçtiğiniz sayı ile sürekli çıkarma alıştırması</p>
                </div>
            `;
        } else if (moduleType === 'carpma') {
            const birBasamakliCarpmaAccuracy = this.getExerciseAccuracy('birBasamakliCarpma');
            const ikiBasamakliCarpmaAccuracy = this.getExerciseAccuracy('ikiBasamakliCarpma');
            const ikiCarpıIkiBasamakliAccuracy = this.getExerciseAccuracy('ikiCarpıIkiBasamakli');
            const ikiCarpıBirArtıBirAccuracy = this.getExerciseAccuracy('ikiCarpıBirArtıBir');
            const akilliCarpimTablosuAccuracy = this.getExerciseAccuracy('akilliCarpimTablosu');
            const carpanBulmaAccuracy = this.getExerciseAccuracy('carpanBulma');
            const ileriCarpmaAccuracy = this.getIleriCarpmaAverageAccuracy();
            
            subModules = `
                <div class="sub-module" onclick="moduleSystem.startExercise('birBasamakliCarpma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(birBasamakliCarpmaAccuracy)}">${birBasamakliCarpmaAccuracy}%</div>
                    <h4>Bir Basamaklı Çarpma</h4>
                    <p>Bir basamaklı sayılarda çarpma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiBasamakliCarpma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiBasamakliCarpmaAccuracy)}">${ikiBasamakliCarpmaAccuracy}%</div>
                    <h4>İki × Bir Basamaklı Çarpma</h4>
                    <p>İki basamaklı × bir basamaklı sayılarda çarpma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiCarpıIkiBasamakli')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiCarpıIkiBasamakliAccuracy)}">${ikiCarpıIkiBasamakliAccuracy}%</div>
                    <h4>İki × İki Basamaklı Çarpma</h4>
                    <p>İki basamaklı × iki basamaklı sayılarda çarpma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('ikiCarpıBirArtıBir')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ikiCarpıBirArtıBirAccuracy)}">${ikiCarpıBirArtıBirAccuracy}%</div>
                    <h4>İki × Bir + Bir</h4>
                    <p>İki basamaklı × bir basamaklı + bir basamaklı alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.showIleriCarpma()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(ileriCarpmaAccuracy)}">${ileriCarpmaAccuracy}%</div>
                    <h4>İleri Çarpma</h4>
                    <p>Seçtiğiniz sayı ile sürekli çarpma alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('akilliCarpimTablosu')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(akilliCarpimTablosuAccuracy)}">${akilliCarpimTablosuAccuracy}%</div>
                    <h4>Akıllı Çarpım Tablosu</h4>
                    <p>Anki tarzı akıllı çarpım tablosu alıştırması</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startExercise('carpanBulma')">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(carpanBulmaAccuracy)}">${carpanBulmaAccuracy}%</div>
                    <h4>Çarpan Bulma</h4>
                    <p>Çarpımı verilen sayının çarpanını bulma alıştırması</p>
                </div>
            `;
        } else if (moduleType === 'uslu') {
            const karesiniAlmaAccuracy = this.getExerciseAccuracy('karesiniAlma');
            
            subModules = `
                <div class="sub-module" onclick="moduleSystem.showUsluSayiSecimi()">
                    <h4>Üslü Sayı Seçimi</h4>
                    <p>2-9 arası sayılarla üslü işlemler yapın</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.showKaresiniAlmaAltModuller()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(karesiniAlmaAccuracy)}">${karesiniAlmaAccuracy}%</div>
                    <h4>Karesini Alma</h4>
                    <p>11-20 arası sayıların karelerini hesaplayın</p>
                </div>
            `;
        } else if (moduleType === 'faktoriyel') {
            const faktoriyelCevapBulma1Accuracy = this.getExerciseAccuracy('faktoriyelCevapBulma1');
            const faktoriyelCevapBulma2Accuracy = this.getExerciseAccuracy('faktoriyelCevapBulma2');
            const faktoriyelSayiBulma1Accuracy = this.getExerciseAccuracy('faktoriyelSayiBulma1');
            const faktoriyelSayiBulma2Accuracy = this.getExerciseAccuracy('faktoriyelSayiBulma2');
            
            subModules = `
                <div class="sub-module" onclick="moduleSystem.startFaktoriyelCevapBulma1()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(faktoriyelCevapBulma1Accuracy)}">${faktoriyelCevapBulma1Accuracy}%</div>
                    <h4>Faktöriyel Cevap Bulma (1-6!)</h4>
                    <p>1! ile 6! arası faktöriyellerin sonucunu hesaplayın</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startFaktoriyelCevapBulma2()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(faktoriyelCevapBulma2Accuracy)}">${faktoriyelCevapBulma2Accuracy}%</div>
                    <h4>Faktöriyel Cevap Bulma (7-10!)</h4>
                    <p>7! ile 10! arası faktöriyellerin sonucunu hesaplayın</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startFaktoriyelSayiBulma1()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(faktoriyelSayiBulma1Accuracy)}">${faktoriyelSayiBulma1Accuracy}%</div>
                    <h4>Faktöriyel Sayı Bulma (1-6!)</h4>
                    <p>Verilen sonucun hangi faktöriyel olduğunu bulun</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startFaktoriyelSayiBulma2()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(faktoriyelSayiBulma2Accuracy)}">${faktoriyelSayiBulma2Accuracy}%</div>
                    <h4>Faktöriyel Sayı Bulma (7-10!)</h4>
                    <p>Verilen sonucun hangi faktöriyel olduğunu bulun</p>
                </div>
            `;
        } else if (moduleType === 'kesirler') {
            const kesirliYuzdeAccuracy = this.getExerciseAccuracy('kesirliYuzde');
            const yuzdeliKesirAccuracy = this.getExerciseAccuracy('yuzdeliKesir');
            const kesirliOndalikAccuracy = this.getExerciseAccuracy('kesirliOndalik');
            const yuzdeliOndalikAccuracy = this.getExerciseAccuracy('yuzdeliOndalik');
            
            subModules = `
                <div class="sub-module" onclick="moduleSystem.startKesirliYuzde()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(kesirliYuzdeAccuracy)}">${kesirliYuzdeAccuracy}%</div>
                    <h4>Kesirli İfadelerin Yüzde Karşılığı</h4>
                    <p>Kesirli ifadelerin yüzde kaça denk geldiğini hesaplayın</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startYuzdeliKesir()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(yuzdeliKesirAccuracy)}">${yuzdeliKesirAccuracy}%</div>
                    <h4>Yüzdeli İfadelerin Kesir Karşılığı</h4>
                    <p>Yüzde değerlerinin hangi kesire denk geldiğini bulun</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startKesirliOndalik()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(kesirliOndalikAccuracy)}">${kesirliOndalikAccuracy}%</div>
                    <h4>Kesirli İfadelerin Ondalıklı Sayı Karşılığı</h4>
                    <p>Kesirli ifadelerin ondalıklı sayı olarak kaça denk geldiğini hesaplayın</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startYuzdeliOndalik()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(yuzdeliOndalikAccuracy)}">${yuzdeliOndalikAccuracy}%</div>
                    <h4>Yüzdeli İfadelerin Ondalıklı Sayı Karşılığı</h4>
                    <p>Yüzde değerlerinin ondalıklı sayı olarak kaça denk geldiğini bulun</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startKesirSadelestirme()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(this.getExerciseAccuracy('kesirSadelestirme'))}">${this.getExerciseAccuracy('kesirSadelestirme')}%</div>
                    <h4>Kesir Sadeleştirme</h4>
                    <p>Kesirleri en sade haline getirin</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startKesirliIslemler()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(this.getExerciseAccuracy('kesirliIslemler'))}">${this.getExerciseAccuracy('kesirliIslemler')}%</div>
                    <h4>Tam Sayı + Rasyonel Sayı İşlemleri</h4>
                    <p>Tam sayı ile kesir arasında toplama ve çıkarma işlemleri yapın</p>
                </div>
                <div class="sub-module" onclick="moduleSystem.startKesirPaydaOrtakKati()">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(this.getExerciseAccuracy('kesirPaydaOrtakKati'))}">${this.getExerciseAccuracy('kesirPaydaOrtakKati')}%</div>
                    <h4>Kesir Paydalarının Ortak Katı</h4>
                    <p>İki kesrin paydalarının birleşeceği ortak katı bulun</p>
                </div>
            `;
        }

        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showMainModules()">← Ana Sayfaya Dön</button>
            <h2>${this.getModuleTitle(moduleType)}</h2>
            ${subModules}
        `;
    }

    // Modül başlığını getir
    getModuleTitle(moduleType) {
        const titles = {
            'toplama': 'Toplama Modülü',
            'cikarma': 'Çıkarma Modülü',
            'carpma': 'Çarpma Modülü',
            'uslu': 'Üslü Sayılar Modülü',
            'faktoriyel': 'Faktöriyel Modülü',
            'kesirler': 'Kesirler Modülü'
        };
        return titles[moduleType] || 'Modül';
    }

    // Alıştırmayı başlat
    startExercise(exerciseType) {
        this.currentSubModule = exerciseType;
        const mainContent = document.getElementById('main-content');
        
        let exerciseTitle = '';
        let exerciseDescription = '';
        
        if (exerciseType === 'birBasamakliToplama') {
            exerciseTitle = 'Bir + Bir Basamaklı Toplama';
            exerciseDescription = 'Bir basamaklı + bir basamaklı sayıyı toplayın';
        } else if (exerciseType === 'ikiArtıBirBasamakliToplama') {
            exerciseTitle = 'İki + Bir Basamaklı Toplama';
            exerciseDescription = 'İki basamaklı + bir basamaklı sayıyı toplayın';
        } else if (exerciseType === 'ucArtıBirBasamakliToplama') {
            exerciseTitle = 'Üç + Bir Basamaklı Toplama';
            exerciseDescription = 'Üç basamaklı + bir basamaklı sayıyı toplayın';
        } else if (exerciseType === 'ikiArtıIkiBasamakliToplama') {
            exerciseTitle = 'İki + İki Basamaklı Toplama';
            exerciseDescription = 'İki basamaklı + iki basamaklı sayıyı toplayın';
        } else if (exerciseType === 'birBasamakliCikarma') {
            exerciseTitle = 'Bir - Bir Basamaklı Çıkarma';
            exerciseDescription = 'Bir basamaklı - bir basamaklı sayıyı çıkarın';
        } else if (exerciseType === 'ikiArtıBirBasamakliCikarma') {
            exerciseTitle = 'İki - Bir Basamaklı Çıkarma';
            exerciseDescription = 'İki basamaklı - bir basamaklı sayıyı çıkarın';
        } else if (exerciseType === 'ucArtıBirBasamakliCikarma') {
            exerciseTitle = 'Üç - Bir Basamaklı Çıkarma';
            exerciseDescription = 'Üç basamaklı - bir basamaklı sayıyı çıkarın';
        } else if (exerciseType === 'ikiArtıIkiBasamakliCikarma') {
            exerciseTitle = 'İki - İki Basamaklı Çıkarma';
            exerciseDescription = 'İki basamaklı - iki basamaklı sayıyı çıkarın';
        } else if (exerciseType === 'birBasamakliCarpma') {
            exerciseTitle = 'Bir Basamaklı Çarpma';
            exerciseDescription = 'İki bir basamaklı sayıyı çarpın';
        } else if (exerciseType === 'ikiBasamakliCarpma') {
            exerciseTitle = 'İki × Bir Basamaklı Çarpma';
            exerciseDescription = 'İki basamaklı × bir basamaklı sayıyı çarpın';
        } else if (exerciseType === 'ikiCarpıIkiBasamakli') {
            exerciseTitle = 'İki × İki Basamaklı Çarpma';
            exerciseDescription = 'İki basamaklı × iki basamaklı sayıyı çarpın';
        } else if (exerciseType === 'ikiCarpıBirArtıBir') {
            exerciseTitle = 'İki × Bir + Bir';
            exerciseDescription = 'İki basamaklı × bir basamaklı + bir basamaklı işlemi yapın';
        } else if (exerciseType === 'akilliCarpimTablosu') {
            exerciseTitle = 'Akıllı Çarpım Tablosu';
            exerciseDescription = 'Anki tarzı akıllı çarpım tablosu alıştırması';
        } else if (exerciseType === 'carpanBulma') {
            exerciseTitle = 'Çarpan Bulma';
            exerciseDescription = 'Çarpımı verilen sayının çarpanını bulun';
        }

        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('${this.currentModule}')">← Alt Modüllere Dön</button>
            <h2>${exerciseTitle}</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">${exerciseDescription}</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateQuestion();
    }

    // Yeni soru üret
    generateQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        let question, answer;
        
        if (this.currentSubModule === 'birBasamakliToplama') {
            question = this.generateBirBasamakliToplamaSorusu();
            answer = this.getBirBasamakliToplamaCevabi(question);
        } else if (this.currentSubModule === 'ikiArtıBirBasamakliToplama') {
            question = this.generateIkiArtıBirBasamakliToplamaSorusu();
            answer = this.getIkiArtıBirBasamakliToplamaCevabi(question);
        } else if (this.currentSubModule === 'ucArtıBirBasamakliToplama') {
            question = this.generateUcArtıBirBasamakliToplamaSorusu();
            answer = this.getUcArtıBirBasamakliToplamaCevabi(question);
        } else if (this.currentSubModule === 'ikiArtıIkiBasamakliToplama') {
            question = this.generateIkiArtıIkiBasamakliToplamaSorusu();
            answer = this.getIkiArtıIkiBasamakliToplamaCevabi(question);
        } else if (this.currentSubModule === 'birBasamakliCikarma') {
            question = this.generateBirBasamakliCikarmaSorusu();
            answer = this.getBirBasamakliCikarmaCevabi(question);
        } else if (this.currentSubModule === 'ikiArtıBirBasamakliCikarma') {
            question = this.generateIkiArtıBirBasamakliCikarmaSorusu();
            answer = this.getIkiArtıBirBasamakliCikarmaCevabi(question);
        } else if (this.currentSubModule === 'ucArtıBirBasamakliCikarma') {
            question = this.generateUcArtıBirBasamakliCikarmaSorusu();
            answer = this.getUcArtıBirBasamakliCikarmaCevabi(question);
        } else if (this.currentSubModule === 'ikiArtıIkiBasamakliCikarma') {
            question = this.generateIkiArtıIkiBasamakliCikarmaSorusu();
            answer = this.getIkiArtıIkiBasamakliCikarmaCevabi(question);
        } else if (this.currentSubModule === 'birBasamakliCarpma') {
            const num1 = Math.floor(Math.random() * 9) + 1;
            const num2 = Math.floor(Math.random() * 9) + 1;
            question = `${num1} × ${num2}`;
            answer = num1 * num2;
        } else if (this.currentSubModule === 'ikiBasamakliCarpma') {
            question = this.generateIkiBasamakliCarpmaSorusu();
            answer = this.getIkiBasamakliCarpmaCevabi(question);
        } else if (this.currentSubModule === 'ikiCarpıIkiBasamakli') {
            question = this.generateIkiCarpıIkiBasamakliSorusu();
            answer = this.getIkiCarpıIkiBasamakliCevabi(question);
        } else if (this.currentSubModule === 'ikiCarpıBirArtıBir') {
            question = this.generateIkiCarpıBirArtıBirSorusu();
            answer = this.getIkiCarpıBirArtıBirCevabi(question);
        } else if (this.currentSubModule === 'akilliCarpimTablosu') {
            question = this.generateAkilliCarpimSorusu();
            answer = this.getAkilliCarpimCevabi(question);
        } else if (this.currentSubModule === 'carpanBulma') {
            question = this.generateCarpanBulmaSorusu();
            answer = this.getCarpanBulmaCevabi(question);
        }

        // 3 seçenek oluştur: 1 doğru + 2 yanlış
        const options = this.generateOptions(answer);
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question}</div>
                <div class="options-container">
                    <button class="option-button" onclick="moduleSystem.checkAnswerFromButton(${answer}, ${options[0]})">${options[0]}</button>
                    <button class="option-button" onclick="moduleSystem.checkAnswerFromButton(${answer}, ${options[1]})">${options[1]}</button>
                    <button class="option-button" onclick="moduleSystem.checkAnswerFromButton(${answer}, ${options[2]})">${options[2]}</button>
                </div>
                <div id="result"></div>
            </div>
        `;
    }

    // İki basamaklı çarpma sorusu üret
    generateIkiBasamakliCarpmaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiBasamakliCarpmaSorusu) {
            this.lastIkiBasamakliCarpmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiBasamakliCarpmaSorulari().filter(soru => soru !== this.lastIkiBasamakliCarpmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiBasamakliCarpmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiBasamakliCarpmaSorulari().filter(soru => soru !== this.lastIkiBasamakliCarpmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiBasamakliCarpmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiBasamakliCarpmaKombinasyonlari().filter(soru => soru !== this.lastIkiBasamakliCarpmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiBasamakliCarpmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiBasamakliCarpmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiBasamakliCarpmaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiBasamakliCarpmaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki basamaklı çarpma sorusunun cevabını getir
    getIkiBasamakliCarpmaCevabi(question) {
        const parts = question.split(' × ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 * num2;
    }

    // İki basamaklı çarpma için tüm kombinasyonları oluştur
    generateIkiBasamakliCarpmaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            for (let j = 1; j <= 9; j++) {
                kombinasyonlar.push(`${i} × ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan iki basamaklı çarpma sorularını getir
    getHataliIkiBasamakliCarpmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const carpmaStats = exerciseStats['ikiBasamakliCarpma'] || {};
        const hataliSorular = [];
        
        if (carpmaStats.questionHistory) {
            Object.keys(carpmaStats.questionHistory).forEach(question => {
                if (carpmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki basamaklı çarpma sorularını getir (büyük sayılarla)
    getZorIkiBasamakliCarpmaSorulari() {
        const zorSorular = [];
        for (let i = 70; i <= 99; i++) {
            for (let j = 7; j <= 9; j++) {
                zorSorular.push(`${i} × ${j}`);
            }
        }
        return zorSorular;
    }

    // Bir basamaklı toplama sorusu üret
    generateBirBasamakliToplamaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastBirBasamakliToplamaSorusu) {
            this.lastBirBasamakliToplamaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliBirBasamakliToplamaSorulari().filter(soru => soru !== this.lastBirBasamakliToplamaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorBirBasamakliToplamaSorulari().filter(soru => soru !== this.lastBirBasamakliToplamaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateBirBasamakliToplamaKombinasyonlari().filter(soru => soru !== this.lastBirBasamakliToplamaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastBirBasamakliToplamaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateBirBasamakliToplamaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastBirBasamakliToplamaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // Bir basamaklı toplama sorusunun cevabını getir
    getBirBasamakliToplamaCevabi(question) {
        const parts = question.split(' + ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 + num2;
    }

    // Bir basamaklı toplama için tüm kombinasyonları oluştur
    generateBirBasamakliToplamaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                kombinasyonlar.push(`${i} + ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan bir basamaklı toplama sorularını getir
    getHataliBirBasamakliToplamaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const toplamaStats = exerciseStats['birBasamakliToplama'] || {};
        const hataliSorular = [];
        
        if (toplamaStats.questionHistory) {
            Object.keys(toplamaStats.questionHistory).forEach(question => {
                if (toplamaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor bir basamaklı toplama sorularını getir (büyük sayılarla)
    getZorBirBasamakliToplamaSorulari() {
        const zorSorular = [];
        for (let i = 7; i <= 9; i++) {
            for (let j = 7; j <= 9; j++) {
                zorSorular.push(`${i} + ${j}`);
            }
        }
        return zorSorular;
    }

    // İki + bir basamaklı toplama sorusu üret
    generateIkiArtıBirBasamakliToplamaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiArtıBirBasamakliToplamaSorusu) {
            this.lastIkiArtıBirBasamakliToplamaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiArtıBirBasamakliToplamaSorulari().filter(soru => soru !== this.lastIkiArtıBirBasamakliToplamaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiArtıBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiArtıBirBasamakliToplamaSorulari().filter(soru => soru !== this.lastIkiArtıBirBasamakliToplamaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiArtıBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiArtıBirBasamakliToplamaKombinasyonlari().filter(soru => soru !== this.lastIkiArtıBirBasamakliToplamaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiArtıBirBasamakliToplamaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiArtıBirBasamakliToplamaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiArtıBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiArtıBirBasamakliToplamaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki + bir basamaklı toplama sorusunun cevabını getir
    getIkiArtıBirBasamakliToplamaCevabi(question) {
        const parts = question.split(' + ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 + num2;
    }

    // İki + bir basamaklı toplama için tüm kombinasyonları oluştur
    generateIkiArtıBirBasamakliToplamaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            for (let j = 1; j <= 9; j++) {
                kombinasyonlar.push(`${i} + ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan iki + bir basamaklı toplama sorularını getir
    getHataliIkiArtıBirBasamakliToplamaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const toplamaStats = exerciseStats['ikiArtıBirBasamakliToplama'] || {};
        const hataliSorular = [];
        
        if (toplamaStats.questionHistory) {
            Object.keys(toplamaStats.questionHistory).forEach(question => {
                if (toplamaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki + bir basamaklı toplama sorularını getir (büyük sayılarla)
    getZorIkiArtıBirBasamakliToplamaSorulari() {
        const zorSorular = [];
        for (let i = 80; i <= 99; i++) {
            for (let j = 7; j <= 9; j++) {
                zorSorular.push(`${i} + ${j}`);
            }
        }
        return zorSorular;
    }

    // Üç + bir basamaklı toplama sorusu üret
    generateUcArtıBirBasamakliToplamaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastUcArtıBirBasamakliToplamaSorusu) {
            this.lastUcArtıBirBasamakliToplamaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliUcArtıBirBasamakliToplamaSorulari().filter(soru => soru !== this.lastUcArtıBirBasamakliToplamaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastUcArtıBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorUcArtıBirBasamakliToplamaSorulari().filter(soru => soru !== this.lastUcArtıBirBasamakliToplamaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastUcArtıBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateUcArtıBirBasamakliToplamaKombinasyonlari().filter(soru => soru !== this.lastUcArtıBirBasamakliToplamaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastUcArtıBirBasamakliToplamaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateUcArtıBirBasamakliToplamaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastUcArtıBirBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastUcArtıBirBasamakliToplamaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // Üç + bir basamaklı toplama sorusunun cevabını getir
    getUcArtıBirBasamakliToplamaCevabi(question) {
        const parts = question.split(' + ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 + num2;
    }

    // Üç + bir basamaklı toplama için tüm kombinasyonları oluştur
    generateUcArtıBirBasamakliToplamaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 100; i <= 999; i++) {
            for (let j = 1; j <= 9; j++) {
                kombinasyonlar.push(`${i} + ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan üç + bir basamaklı toplama sorularını getir
    getHataliUcArtıBirBasamakliToplamaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const toplamaStats = exerciseStats['ucArtıBirBasamakliToplama'] || {};
        const hataliSorular = [];
        
        if (toplamaStats.questionHistory) {
            Object.keys(toplamaStats.questionHistory).forEach(question => {
                if (toplamaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor üç + bir basamaklı toplama sorularını getir (büyük sayılarla)
    getZorUcArtıBirBasamakliToplamaSorulari() {
        const zorSorular = [];
        for (let i = 800; i <= 999; i++) {
            for (let j = 7; j <= 9; j++) {
                zorSorular.push(`${i} + ${j}`);
            }
        }
        return zorSorular;
    }

    // İki + iki basamaklı toplama sorusu üret
    generateIkiArtıIkiBasamakliToplamaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiArtıIkiBasamakliToplamaSorusu) {
            this.lastIkiArtıIkiBasamakliToplamaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiArtıIkiBasamakliToplamaSorulari().filter(soru => soru !== this.lastIkiArtıIkiBasamakliToplamaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiArtıIkiBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiArtıIkiBasamakliToplamaSorulari().filter(soru => soru !== this.lastIkiArtıIkiBasamakliToplamaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiArtıIkiBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiArtıIkiBasamakliToplamaKombinasyonlari().filter(soru => soru !== this.lastIkiArtıIkiBasamakliToplamaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiArtıIkiBasamakliToplamaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiArtıIkiBasamakliToplamaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiArtıIkiBasamakliToplamaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiArtıIkiBasamakliToplamaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki + iki basamaklı toplama sorusunun cevabını getir
    getIkiArtıIkiBasamakliToplamaCevabi(question) {
        const parts = question.split(' + ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 + num2;
    }

    // İki + iki basamaklı toplama için tüm kombinasyonları oluştur
    generateIkiArtıIkiBasamakliToplamaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            for (let j = 10; j <= 99; j++) {
                kombinasyonlar.push(`${i} + ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan iki + iki basamaklı toplama sorularını getir
    getHataliIkiArtıIkiBasamakliToplamaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const toplamaStats = exerciseStats['ikiArtıIkiBasamakliToplama'] || {};
        const hataliSorular = [];
        
        if (toplamaStats.questionHistory) {
            Object.keys(toplamaStats.questionHistory).forEach(question => {
                if (toplamaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki + iki basamaklı toplama sorularını getir (büyük sayılarla)
    getZorIkiArtıIkiBasamakliToplamaSorulari() {
        const zorSorular = [];
        for (let i = 80; i <= 99; i++) {
            for (let j = 80; j <= 99; j++) {
                zorSorular.push(`${i} + ${j}`);
            }
        }
        return zorSorular;
    }

    // Bir basamaklı çıkarma sorusu üret
    generateBirBasamakliCikarmaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastBirBasamakliCikarmaSorusu) {
            this.lastBirBasamakliCikarmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliBirBasamakliCikarmaSorulari().filter(soru => soru !== this.lastBirBasamakliCikarmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorBirBasamakliCikarmaSorulari().filter(soru => soru !== this.lastBirBasamakliCikarmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateBirBasamakliCikarmaKombinasyonlari().filter(soru => soru !== this.lastBirBasamakliCikarmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastBirBasamakliCikarmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateBirBasamakliCikarmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastBirBasamakliCikarmaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // Bir basamaklı çıkarma sorusunun cevabını getir
    getBirBasamakliCikarmaCevabi(question) {
        const parts = question.split(' - ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 - num2;
    }

    // Bir basamaklı çıkarma için tüm kombinasyonları oluştur (negatif sonuç olmayacak şekilde)
    generateBirBasamakliCikarmaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= i; j++) { // j <= i olması negatif sonuç olmamasını sağlar
                kombinasyonlar.push(`${i} - ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan bir basamaklı çıkarma sorularını getir
    getHataliBirBasamakliCikarmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const cikarmaStats = exerciseStats['birBasamakliCikarma'] || {};
        const hataliSorular = [];
        
        if (cikarmaStats.questionHistory) {
            Object.keys(cikarmaStats.questionHistory).forEach(question => {
                if (cikarmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor bir basamaklı çıkarma sorularını getir (büyük sayılarla)
    getZorBirBasamakliCikarmaSorulari() {
        const zorSorular = [];
        for (let i = 7; i <= 9; i++) {
            for (let j = 5; j <= i; j++) {
                zorSorular.push(`${i} - ${j}`);
            }
        }
        return zorSorular;
    }

    // İki - bir basamaklı çıkarma sorusu üret
    generateIkiArtıBirBasamakliCikarmaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiArtıBirBasamakliCikarmaSorusu) {
            this.lastIkiArtıBirBasamakliCikarmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiArtıBirBasamakliCikarmaSorulari().filter(soru => soru !== this.lastIkiArtıBirBasamakliCikarmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiArtıBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiArtıBirBasamakliCikarmaSorulari().filter(soru => soru !== this.lastIkiArtıBirBasamakliCikarmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiArtıBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiArtıBirBasamakliCikarmaKombinasyonlari().filter(soru => soru !== this.lastIkiArtıBirBasamakliCikarmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiArtıBirBasamakliCikarmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiArtıBirBasamakliCikarmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiArtıBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiArtıBirBasamakliCikarmaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki - bir basamaklı çıkarma sorusunun cevabını getir
    getIkiArtıBirBasamakliCikarmaCevabi(question) {
        const parts = question.split(' - ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 - num2;
    }

    // İki - bir basamaklı çıkarma için tüm kombinasyonları oluştur (negatif sonuç olmayacak şekilde)
    generateIkiArtıBirBasamakliCikarmaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            for (let j = 1; j <= 9; j++) {
                if (i - j >= 0) { // Negatif sonuç olmamasını sağla
                    kombinasyonlar.push(`${i} - ${j}`);
                }
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan iki - bir basamaklı çıkarma sorularını getir
    getHataliIkiArtıBirBasamakliCikarmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const cikarmaStats = exerciseStats['ikiArtıBirBasamakliCikarma'] || {};
        const hataliSorular = [];
        
        if (cikarmaStats.questionHistory) {
            Object.keys(cikarmaStats.questionHistory).forEach(question => {
                if (cikarmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki - bir basamaklı çıkarma sorularını getir (büyük sayılarla)
    getZorIkiArtıBirBasamakliCikarmaSorulari() {
        const zorSorular = [];
        for (let i = 80; i <= 99; i++) {
            for (let j = 7; j <= 9; j++) {
                if (i - j >= 0) {
                    zorSorular.push(`${i} - ${j}`);
                }
            }
        }
        return zorSorular;
    }

    // Üç - bir basamaklı çıkarma sorusu üret
    generateUcArtıBirBasamakliCikarmaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastUcArtıBirBasamakliCikarmaSorusu) {
            this.lastUcArtıBirBasamakliCikarmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliUcArtıBirBasamakliCikarmaSorulari().filter(soru => soru !== this.lastUcArtıBirBasamakliCikarmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastUcArtıBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorUcArtıBirBasamakliCikarmaSorulari().filter(soru => soru !== this.lastUcArtıBirBasamakliCikarmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastUcArtıBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateUcArtıBirBasamakliCikarmaKombinasyonlari().filter(soru => soru !== this.lastUcArtıBirBasamakliCikarmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastUcArtıBirBasamakliCikarmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateUcArtıBirBasamakliCikarmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastUcArtıBirBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastUcArtıBirBasamakliCikarmaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // Üç - bir basamaklı çıkarma sorusunun cevabını getir
    getUcArtıBirBasamakliCikarmaCevabi(question) {
        const parts = question.split(' - ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 - num2;
    }

    // Üç - bir basamaklı çıkarma için tüm kombinasyonları oluştur (negatif sonuç olmayacak şekilde)
    generateUcArtıBirBasamakliCikarmaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 100; i <= 999; i++) {
            for (let j = 1; j <= 9; j++) {
                if (i - j >= 0) { // Negatif sonuç olmamasını sağla
                    kombinasyonlar.push(`${i} - ${j}`);
                }
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan üç - bir basamaklı çıkarma sorularını getir
    getHataliUcArtıBirBasamakliCikarmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const cikarmaStats = exerciseStats['ucArtıBirBasamakliCikarma'] || {};
        const hataliSorular = [];
        
        if (cikarmaStats.questionHistory) {
            Object.keys(cikarmaStats.questionHistory).forEach(question => {
                if (cikarmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor üç - bir basamaklı çıkarma sorularını getir (büyük sayılarla)
    getZorUcArtıBirBasamakliCikarmaSorulari() {
        const zorSorular = [];
        for (let i = 800; i <= 999; i++) {
            for (let j = 7; j <= 9; j++) {
                if (i - j >= 0) {
                    zorSorular.push(`${i} - ${j}`);
                }
            }
        }
        return zorSorular;
    }

    // İki - iki basamaklı çıkarma sorusu üret
    generateIkiArtıIkiBasamakliCikarmaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiArtıIkiBasamakliCikarmaSorusu) {
            this.lastIkiArtıIkiBasamakliCikarmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiArtıIkiBasamakliCikarmaSorulari().filter(soru => soru !== this.lastIkiArtıIkiBasamakliCikarmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiArtıIkiBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiArtıIkiBasamakliCikarmaSorulari().filter(soru => soru !== this.lastIkiArtıIkiBasamakliCikarmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiArtıIkiBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiArtıIkiBasamakliCikarmaKombinasyonlari().filter(soru => soru !== this.lastIkiArtıIkiBasamakliCikarmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiArtıIkiBasamakliCikarmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiArtıIkiBasamakliCikarmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiArtıIkiBasamakliCikarmaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiArtıIkiBasamakliCikarmaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki - iki basamaklı çıkarma sorusunun cevabını getir
    getIkiArtıIkiBasamakliCikarmaCevabi(question) {
        const parts = question.split(' - ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 - num2;
    }

    // İki - iki basamaklı çıkarma için tüm kombinasyonları oluştur (negatif sonuç olmayacak şekilde)
    generateIkiArtıIkiBasamakliCikarmaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            for (let j = 10; j <= i; j++) { // j <= i olması negatif sonuç olmamasını sağlar
                kombinasyonlar.push(`${i} - ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan iki - iki basamaklı çıkarma sorularını getir
    getHataliIkiArtıIkiBasamakliCikarmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const cikarmaStats = exerciseStats['ikiArtıIkiBasamakliCikarma'] || {};
        const hataliSorular = [];
        
        if (cikarmaStats.questionHistory) {
            Object.keys(cikarmaStats.questionHistory).forEach(question => {
                if (cikarmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki - iki basamaklı çıkarma sorularını getir (büyük sayılarla)
    getZorIkiArtıIkiBasamakliCikarmaSorulari() {
        const zorSorular = [];
        for (let i = 80; i <= 99; i++) {
            for (let j = 70; j <= i; j++) {
                zorSorular.push(`${i} - ${j}`);
            }
        }
        return zorSorular;
    }

    // İleri matematik ortalama doğruluk yüzdesini hesapla
    getIleriMatematikAverageAccuracy(operationType) {
        const exerciseStats = this.userStats.exerciseStats || {};
        let totalQuestions = 0;
        let totalCorrect = 0;
        
        // 2'den 9'a kadar olan tüm sayılar için istatistikleri topla
        for (let i = 2; i <= 9; i++) {
            const exerciseKey = operationType === 'toplama' ? `ileriMatematik_${i}` : `ileriMatematikCikarma_${i}`;
            const stats = exerciseStats[exerciseKey] || { total: 0, correct: 0 };
            totalQuestions += stats.total;
            totalCorrect += stats.correct;
        }
        
        if (totalQuestions === 0) return 0;
        return Math.round((totalCorrect / totalQuestions) * 100);
    }

    // İleri matematik sayfa seçimini göster
    showIleriMatematik() {
        const mainContent = document.getElementById('main-content');
        
        let numberButtons = '';
        for (let i = 2; i <= 9; i++) {
            const accuracy = this.getExerciseAccuracy(`ileriMatematik_${i}`);
            numberButtons += `
                <div class="sub-module" onclick="moduleSystem.startIleriMatematik(${i})">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(accuracy)}">${accuracy}%</div>
                    <h4>${i} ile Toplama</h4>
                    <p>İki basamaklı sayılar + ${i} alıştırması</p>
                </div>
            `;
        }
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('toplama')">← Alt Modüllere Dön</button>
            <h2>İleri Matematik - Toplama</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Hangi sayı ile sürekli toplama yapmak istiyorsunuz?</p>
            ${numberButtons}
        `;
    }

    // İleri matematik alıştırmasını başlat
    startIleriMatematik(selectedNumber) {
        this.selectedNumber = selectedNumber;
        this.currentSubModule = 'ileriMatematik';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showIleriMatematik()">← Sayı Seçimine Dön</button>
            <h2>İleri Matematik - ${selectedNumber} ile Toplama</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">İki basamaklı sayılar + ${selectedNumber} alıştırması</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateIleriMatematikQuestion();
    }

    // İleri matematik sorusu üret
    generateIleriMatematikQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastIleriMatematikSorusu) {
            this.lastIleriMatematikSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIleriMatematikSorulari().filter(soru => soru !== this.lastIleriMatematikSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIleriMatematikSorusu = selectedQuestion;
            const answer = this.getIleriMatematikCevabi(selectedQuestion);
            this.showIleriMatematikQuestion(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIleriMatematikSorulari().filter(soru => soru !== this.lastIleriMatematikSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIleriMatematikSorusu = selectedQuestion;
            const answer = this.getIleriMatematikCevabi(selectedQuestion);
            this.showIleriMatematikQuestion(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIleriMatematikKombinasyonlari().filter(soru => soru !== this.lastIleriMatematikSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIleriMatematikSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIleriMatematikKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIleriMatematikSorusu = selectedQuestion;
            const answer = this.getIleriMatematikCevabi(selectedQuestion);
            this.showIleriMatematikQuestion(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIleriMatematikSorusu = selectedQuestion;
        const answer = this.getIleriMatematikCevabi(selectedQuestion);
        this.showIleriMatematikQuestion(selectedQuestion, answer);
    }

    // İleri matematik sorusunu göster
    showIleriMatematikQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // 3 seçenek oluştur: 1 doğru + 2 yanlış
        const options = this.generateOptions(answer);
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question}</div>
                <div class="options-container">
                    <button class="option-button" onclick="moduleSystem.checkIleriMatematikAnswerFromButton(${answer}, ${options[0]})">${options[0]}</button>
                    <button class="option-button" onclick="moduleSystem.checkIleriMatematikAnswerFromButton(${answer}, ${options[1]})">${options[1]}</button>
                    <button class="option-button" onclick="moduleSystem.checkIleriMatematikAnswerFromButton(${answer}, ${options[2]})">${options[2]}</button>
                </div>
                <div id="result"></div>
            </div>
        `;
    }

    // İleri matematik cevabını butonlardan kontrol et
    checkIleriMatematikAnswerFromButton(correctAnswer, userAnswer) {
        const resultDiv = document.getElementById('result');
        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // Tüm butonları devre dışı bırak
        const buttons = document.querySelectorAll('.option-button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });
        
        // Seçilen butonu vurgula
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === userAnswer) {
                if (isCorrect) {
                    btn.style.background = 'rgba(34, 197, 94, 0.2)';
                    btn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                } else {
                    btn.style.background = 'rgba(239, 68, 68, 0.2)';
                    btn.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }
            } else if (parseInt(btn.textContent) === correctAnswer && !isCorrect) {
                // Doğru cevabı göster
                btn.style.background = 'rgba(34, 197, 94, 0.2)';
                btn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
            }
        });
        
        // İstatistikleri güncelle
        this.updateIleriMatematikStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '';
            
            // 500ms sonra yeni soru üret (kısa bir gecikme ile)
            setTimeout(() => {
                this.generateIleriMatematikQuestion();
            }, 500);
        } else {
            resultDiv.innerHTML = '';
            
            // 1 saniye sonra yeni soru üret
            setTimeout(() => {
                this.generateIleriMatematikQuestion();
            }, 1000);
        }
    }

    // İleri matematik cevabını kontrol et
    checkIleriMatematikAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateIleriMatematikStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateIleriMatematikQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // İleri matematik istatistiklerini güncelle
    updateIleriMatematikStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // İleri matematik için özel istatistik güncelleme
        const exerciseKey = `ileriMatematik_${this.selectedNumber}`;
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // İleri matematik sorusunun cevabını getir
    getIleriMatematikCevabi(question) {
        const parts = question.split(' + ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 + num2;
    }

    // İleri matematik için tüm kombinasyonları oluştur
    generateIleriMatematikKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            kombinasyonlar.push(`${i} + ${this.selectedNumber}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan ileri matematik sorularını getir
    getHataliIleriMatematikSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = `ileriMatematik_${this.selectedNumber}`;
        const ileriMatematikStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (ileriMatematikStats.questionHistory) {
            Object.keys(ileriMatematikStats.questionHistory).forEach(question => {
                if (ileriMatematikStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor ileri matematik sorularını getir (büyük sayılarla)
    getZorIleriMatematikSorulari() {
        const zorSorular = [];
        for (let i = 80; i <= 99; i++) {
            zorSorular.push(`${i} + ${this.selectedNumber}`);
        }
        return zorSorular;
    }

    // İleri matematik çıkarma sayfa seçimini göster
    showIleriMatematikCikarma() {
        const mainContent = document.getElementById('main-content');
        
        let numberButtons = '';
        for (let i = 2; i <= 9; i++) {
            const accuracy = this.getExerciseAccuracy(`ileriMatematikCikarma_${i}`);
            numberButtons += `
                <div class="sub-module" onclick="moduleSystem.startIleriMatematikCikarma(${i})">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(accuracy)}">${accuracy}%</div>
                    <h4>${i} ile Çıkarma</h4>
                    <p>İki basamaklı sayılar - ${i} alıştırması</p>
                </div>
            `;
        }
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('cikarma')">← Alt Modüllere Dön</button>
            <h2>İleri Matematik - Çıkarma</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Hangi sayı ile sürekli çıkarma yapmak istiyorsunuz?</p>
            ${numberButtons}
        `;
    }

    // İleri matematik çıkarma alıştırmasını başlat
    startIleriMatematikCikarma(selectedNumber) {
        this.selectedNumber = selectedNumber;
        this.currentSubModule = 'ileriMatematikCikarma';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showIleriMatematikCikarma()">← Sayı Seçimine Dön</button>
            <h2>İleri Matematik - ${selectedNumber} ile Çıkarma</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">İki basamaklı sayılar - ${selectedNumber} alıştırması</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateIleriMatematikCikarmaQuestion();
    }

    // İleri matematik çıkarma sorusu üret
    generateIleriMatematikCikarmaQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastIleriMatematikCikarmaSorusu) {
            this.lastIleriMatematikCikarmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIleriMatematikCikarmaSorulari().filter(soru => soru !== this.lastIleriMatematikCikarmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIleriMatematikCikarmaSorusu = selectedQuestion;
            const answer = this.getIleriMatematikCikarmaCevabi(selectedQuestion);
            this.showIleriMatematikCikarmaQuestion(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIleriMatematikCikarmaSorulari().filter(soru => soru !== this.lastIleriMatematikCikarmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIleriMatematikCikarmaSorusu = selectedQuestion;
            const answer = this.getIleriMatematikCikarmaCevabi(selectedQuestion);
            this.showIleriMatematikCikarmaQuestion(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIleriMatematikCikarmaKombinasyonlari().filter(soru => soru !== this.lastIleriMatematikCikarmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIleriMatematikCikarmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIleriMatematikCikarmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIleriMatematikCikarmaSorusu = selectedQuestion;
            const answer = this.getIleriMatematikCikarmaCevabi(selectedQuestion);
            this.showIleriMatematikCikarmaQuestion(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIleriMatematikCikarmaSorusu = selectedQuestion;
        const answer = this.getIleriMatematikCikarmaCevabi(selectedQuestion);
        this.showIleriMatematikCikarmaQuestion(selectedQuestion, answer);
    }

    // İleri matematik çıkarma sorusunu göster
    showIleriMatematikCikarmaQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question}</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Cevabınızı girin" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkIleriMatematikCikarmaAnswer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkIleriMatematikCikarmaAnswer(answer);
            }
        });
    }

    // İleri matematik çıkarma cevabını kontrol et
    checkIleriMatematikCikarmaAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateIleriMatematikCikarmaStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateIleriMatematikCikarmaQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // İleri matematik çıkarma istatistiklerini güncelle
    updateIleriMatematikCikarmaStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // İleri matematik çıkarma için özel istatistik güncelleme
        const exerciseKey = `ileriMatematikCikarma_${this.selectedNumber}`;
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // İleri matematik çıkarma sorusunun cevabını getir
    getIleriMatematikCikarmaCevabi(question) {
        const parts = question.split(' - ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 - num2;
    }

    // İleri matematik çıkarma için tüm kombinasyonları oluştur (negatif sonuç olmayacak şekilde)
    generateIleriMatematikCikarmaKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 10; i <= 99; i++) {
            if (i - this.selectedNumber >= 0) { // Negatif sonuç olmamasını sağla
                kombinasyonlar.push(`${i} - ${this.selectedNumber}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan ileri matematik çıkarma sorularını getir
    getHataliIleriMatematikCikarmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = `ileriMatematikCikarma_${this.selectedNumber}`;
        const ileriMatematikCikarmaStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (ileriMatematikCikarmaStats.questionHistory) {
            Object.keys(ileriMatematikCikarmaStats.questionHistory).forEach(question => {
                if (ileriMatematikCikarmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor ileri matematik çıkarma sorularını getir (büyük sayılarla)
    getZorIleriMatematikCikarmaSorulari() {
        const zorSorular = [];
        for (let i = 80; i <= 99; i++) {
            if (i - this.selectedNumber >= 0) {
                zorSorular.push(`${i} - ${this.selectedNumber}`);
            }
        }
        return zorSorular;
    }

    // Akıllı çarpım tablosu sorusu üret
    generateAkilliCarpimSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastCarpimSorusu) {
            this.lastCarpimSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliCarpimSorulari().filter(soru => soru !== this.lastCarpimSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastCarpimSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorCarpimSorulari().filter(soru => soru !== this.lastCarpimSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastCarpimSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateCarpimTablosuKombinasyonlari().filter(soru => soru !== this.lastCarpimSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastCarpimSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateCarpimTablosuKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastCarpimSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastCarpimSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // Akıllı çarpım tablosu sorusunun cevabını getir
    getAkilliCarpimCevabi(question) {
        const parts = question.split(' × ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 * num2;
    }

    // Çarpım tablosu için tüm kombinasyonları oluştur
    generateCarpimTablosuKombinasyonlari() {
        const kombinasyonlar = [];
        for (let i = 1; i <= 10; i++) {
            for (let j = 1; j <= 10; j++) {
                kombinasyonlar.push(`${i} × ${j}`);
            }
        }
        return kombinasyonlar;
    }

    // Hata yapılan çarpım tablosu sorularını getir
    getHataliCarpimSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const carpimStats = exerciseStats['akilliCarpimTablosu'] || {};
        const hataliSorular = [];
        
        if (carpimStats.questionHistory) {
            Object.keys(carpimStats.questionHistory).forEach(question => {
                if (carpimStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor çarpım tablosu sorularını getir (büyük sayılarla)
    getZorCarpimSorulari() {
        const zorSorular = [];
        // 7, 8, 9 ile çarpma işlemleri genellikle daha zordur
        for (let i = 7; i <= 10; i++) {
            for (let j = 7; j <= 10; j++) {
                zorSorular.push(`${i} × ${j}`);
            }
        }
        return zorSorular;
    }

    // Çarpan bulma sorusu üret
    generateCarpanBulmaSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastCarpanBulmaSorusu) {
            this.lastCarpanBulmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliCarpanBulmaSorulari().filter(soru => soru !== this.lastCarpanBulmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastCarpanBulmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorCarpanBulmaSorulari().filter(soru => soru !== this.lastCarpanBulmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastCarpanBulmaSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateCarpanBulmaKombinasyonlari().filter(soru => soru !== this.lastCarpanBulmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastCarpanBulmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateCarpanBulmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastCarpanBulmaSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastCarpanBulmaSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // Çarpan bulma sorusunun cevabını getir
    getCarpanBulmaCevabi(question) {
        try {
            // "5 × y = 15" formatındaki soruyu parse et
            const parts = question.split(' × y = ');
            if (parts.length !== 2) {
                console.error('Soru formatı hatalı:', question);
                return 0;
            }
            
            const num1 = parseInt(parts[0]);
            const product = parseInt(parts[1]);
            
            if (isNaN(num1) || isNaN(product)) {
                console.error('Sayılar parse edilemedi:', parts);
                return 0;
            }
            
            // y = product / num1
            const answer = product / num1;
            
            if (isNaN(answer) || !Number.isInteger(answer)) {
                console.error('Cevap geçerli değil:', answer);
                return 0;
            }
            
            return answer;
        } catch (error) {
            console.error('Çarpan bulma cevabı hesaplanırken hata:', error);
            return 0;
        }
    }

    // Çarpan bulma için tüm kombinasyonları oluştur
    generateCarpanBulmaKombinasyonlari() {
        const kombinasyonlar = [];
        
        // Bir çarpan 2-9 arası, çarpım klasik çarpım tablosu sınırları içinde
        for (let i = 2; i <= 9; i++) {
            for (let j = 2; j <= 9; j++) {
                const product = i * j;
                if (product <= 100) { // Çarpım 100'ü geçmesin
                    kombinasyonlar.push(`${i} × y = ${product}`);
                }
            }
        }
        
        return kombinasyonlar;
    }

    // Hata yapılan çarpan bulma sorularını getir
    getHataliCarpanBulmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const carpanBulmaStats = exerciseStats['carpanBulma'] || {};
        const hataliSorular = [];
        
        if (carpanBulmaStats.questionHistory) {
            Object.keys(carpanBulmaStats.questionHistory).forEach(question => {
                if (carpanBulmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor çarpan bulma sorularını getir (büyük sayılarla)
    getZorCarpanBulmaSorulari() {
        const zorSorular = [];
        
        // 7, 8, 9 ile çarpma işlemleri genellikle daha zordur
        for (let i = 7; i <= 9; i++) {
            for (let j = 7; j <= 9; j++) {
                const product = i * j;
                if (product <= 100) {
                    zorSorular.push(`${i} × y = ${product}`);
                }
            }
        }
        
        return zorSorular;
    }

    // İki × bir + bir sorusu üret
    generateIkiCarpıBirArtıBirSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiCarpıBirArtıBirSorusu) {
            this.lastIkiCarpıBirArtıBirSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiCarpıBirArtıBirSorulari().filter(soru => soru !== this.lastIkiCarpıBirArtıBirSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiCarpıBirArtıBirSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiCarpıBirArtıBirSorulari().filter(soru => soru !== this.lastIkiCarpıBirArtıBirSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiCarpıBirArtıBirSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiCarpıBirArtıBirKombinasyonlari().filter(soru => soru !== this.lastIkiCarpıBirArtıBirSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiCarpıBirArtıBirSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiCarpıBirArtıBirKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiCarpıBirArtıBirSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiCarpıBirArtıBirSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki × bir + bir sorusunun cevabını getir
    getIkiCarpıBirArtıBirCevabi(question) {
        try {
            // "45 × 3 + 7" formatındaki soruyu parse et
            const parts = question.split(' × ');
            if (parts.length !== 2) {
                console.error('Soru formatı hatalı:', question);
                return 0;
            }
            
            const num1 = parseInt(parts[0]);
            const remainingPart = parts[1];
            
            // "+" işaretini bul
            const plusIndex = remainingPart.indexOf(' + ');
            if (plusIndex === -1) {
                console.error('Toplama işareti bulunamadı:', remainingPart);
                return 0;
            }
            
            const num2 = parseInt(remainingPart.substring(0, plusIndex));
            const num3 = parseInt(remainingPart.substring(plusIndex + 3));
            
            if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
                console.error('Sayılar parse edilemedi:', { num1, num2, num3 });
                return 0;
            }
            
            // (num1 × num2) + num3
            const answer = (num1 * num2) + num3;
            
            return answer;
        } catch (error) {
            console.error('İki × bir + bir cevabı hesaplanırken hata:', error);
            return 0;
        }
    }

    // İki × bir + bir için tüm kombinasyonları oluştur
    generateIkiCarpıBirArtıBirKombinasyonlari() {
        const kombinasyonlar = [];
        
        // İki basamaklı sayılar (10-99)
        for (let i = 10; i <= 99; i++) {
            // Bir basamaklı çarpan (1-9)
            for (let j = 1; j <= 9; j++) {
                // Bir basamaklı toplanacak sayı (1-9)
                for (let k = 1; k <= 9; k++) {
                    kombinasyonlar.push(`${i} × ${j} + ${k}`);
                }
            }
        }
        
        return kombinasyonlar;
    }

    // Hata yapılan iki × bir + bir sorularını getir
    getHataliIkiCarpıBirArtıBirSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const carpmaStats = exerciseStats['ikiCarpıBirArtıBir'] || {};
        const hataliSorular = [];
        
        if (carpmaStats.questionHistory) {
            Object.keys(carpmaStats.questionHistory).forEach(question => {
                if (carpmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki × bir + bir sorularını getir (büyük sayılarla)
    getZorIkiCarpıBirArtıBirSorulari() {
        const zorSorular = [];
        
        // Büyük iki basamaklı sayılar (80-99) × büyük bir basamaklı (7-9) + büyük bir basamaklı (7-9)
        for (let i = 80; i <= 99; i++) {
            for (let j = 7; j <= 9; j++) {
                for (let k = 7; k <= 9; k++) {
                    zorSorular.push(`${i} × ${j} + ${k}`);
                }
            }
        }
        
        return zorSorular;
    }

    // İki × iki basamaklı çarpma sorusu üret
    generateIkiCarpıIkiBasamakliSorusu() {
        // Son sorulan soruyu hatırla
        if (!this.lastIkiCarpıIkiBasamakliSorusu) {
            this.lastIkiCarpıIkiBasamakliSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIkiCarpıIkiBasamakliSorulari().filter(soru => soru !== this.lastIkiCarpıIkiBasamakliSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIkiCarpıIkiBasamakliSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIkiCarpıIkiBasamakliSorulari().filter(soru => soru !== this.lastIkiCarpıIkiBasamakliSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIkiCarpıIkiBasamakliSorusu = selectedQuestion;
            return selectedQuestion;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIkiCarpıIkiBasamakliKombinasyonlari().filter(soru => soru !== this.lastIkiCarpıIkiBasamakliSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIkiCarpıIkiBasamakliSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIkiCarpıIkiBasamakliKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIkiCarpıIkiBasamakliSorusu = selectedQuestion;
            return selectedQuestion;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIkiCarpıIkiBasamakliSorusu = selectedQuestion;
        return selectedQuestion;
    }

    // İki × iki basamaklı çarpma sorusunun cevabını getir
    getIkiCarpıIkiBasamakliCevabi(question) {
        const parts = question.split(' × ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 * num2;
    }

    // İki × iki basamaklı çarpma için tüm kombinasyonları oluştur
    generateIkiCarpıIkiBasamakliKombinasyonlari() {
        const kombinasyonlar = [];
        
        // İki basamaklı sayılar (10-99) × iki basamaklı sayılar (10-99)
        for (let i = 10; i <= 99; i++) {
            for (let j = 10; j <= 99; j++) {
                kombinasyonlar.push(`${i} × ${j}`);
            }
        }
        
        return kombinasyonlar;
    }

    // Hata yapılan iki × iki basamaklı çarpma sorularını getir
    getHataliIkiCarpıIkiBasamakliSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const carpmaStats = exerciseStats['ikiCarpıIkiBasamakli'] || {};
        const hataliSorular = [];
        
        if (carpmaStats.questionHistory) {
            Object.keys(carpmaStats.questionHistory).forEach(question => {
                if (carpmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor iki × iki basamaklı çarpma sorularını getir (büyük sayılarla)
    getZorIkiCarpıIkiBasamakliSorulari() {
        const zorSorular = [];
        
        // Büyük iki basamaklı sayılar (80-99) × büyük iki basamaklı sayılar (80-99)
        for (let i = 80; i <= 99; i++) {
            for (let j = 80; j <= 99; j++) {
                zorSorular.push(`${i} × ${j}`);
            }
        }
        
        return zorSorular;
    }

    // İleri çarpma ortalama doğruluk yüzdesini hesapla
    getIleriCarpmaAverageAccuracy() {
        const exerciseStats = this.userStats.exerciseStats || {};
        let totalQuestions = 0;
        let totalCorrect = 0;
        
        // 15, 25, 50, 75 sayıları için istatistikleri topla
        const numbers = [15, 25, 50, 75];
        numbers.forEach(number => {
            const exerciseKey = `ileriCarpma_${number}`;
            const stats = exerciseStats[exerciseKey] || { total: 0, correct: 0 };
            totalQuestions += stats.total;
            totalCorrect += stats.correct;
        });
        
        if (totalQuestions === 0) return 0;
        return Math.round((totalCorrect / totalQuestions) * 100);
    }

    // İleri çarpma sayfa seçimini göster
    showIleriCarpma() {
        const mainContent = document.getElementById('main-content');
        
        let numberButtons = '';
        const numbers = [15, 25, 50, 75];
        
        numbers.forEach(number => {
            const accuracy = this.getExerciseAccuracy(`ileriCarpma_${number}`);
            numberButtons += `
                <div class="sub-module" onclick="moduleSystem.startIleriCarpma(${number})">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(accuracy)}">${accuracy}%</div>
                    <h4>${number} ile Çarpma</h4>
                    <p>${number} × 2-9 arası sayılarla çarpma alıştırması</p>
                </div>
            `;
        });
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('carpma')">← Alt Modüllere Dön</button>
            <h2>İleri Çarpma</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Hangi sayı ile sürekli çarpma yapmak istiyorsunuz?</p>
            ${numberButtons}
        `;
    }

    // İleri çarpma alıştırmasını başlat
    startIleriCarpma(selectedNumber) {
        this.selectedNumber = selectedNumber;
        this.currentSubModule = 'ileriCarpma';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showIleriCarpma()">← Sayı Seçimine Dön</button>
            <h2>İleri Çarpma - ${selectedNumber} ile Çarpma</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">${selectedNumber} × 2-9 arası sayılarla çarpma alıştırması</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateIleriCarpmaQuestion();
    }

    // İleri çarpma sorusu üret
    generateIleriCarpmaQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastIleriCarpmaSorusu) {
            this.lastIleriCarpmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliIleriCarpmaSorulari().filter(soru => soru !== this.lastIleriCarpmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastIleriCarpmaSorusu = selectedQuestion;
            const answer = this.getIleriCarpmaCevabi(selectedQuestion);
            this.showIleriCarpmaQuestion(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorIleriCarpmaSorulari().filter(soru => soru !== this.lastIleriCarpmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastIleriCarpmaSorusu = selectedQuestion;
            const answer = this.getIleriCarpmaCevabi(selectedQuestion);
            this.showIleriCarpmaQuestion(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateIleriCarpmaKombinasyonlari().filter(soru => soru !== this.lastIleriCarpmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastIleriCarpmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateIleriCarpmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastIleriCarpmaSorusu = selectedQuestion;
            const answer = this.getIleriCarpmaCevabi(selectedQuestion);
            this.showIleriCarpmaQuestion(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastIleriCarpmaSorusu = selectedQuestion;
        const answer = this.getIleriCarpmaCevabi(selectedQuestion);
        this.showIleriCarpmaQuestion(selectedQuestion, answer);
    }

    // İleri çarpma sorusunu göster
    showIleriCarpmaQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question}</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Cevabınızı girin" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkIleriCarpmaAnswer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkIleriCarpmaAnswer(answer);
            }
        });
    }

    // İleri çarpma cevabını kontrol et
    checkIleriCarpmaAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateIleriCarpmaStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateIleriCarpmaQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // İleri çarpma istatistiklerini güncelle
    updateIleriCarpmaStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // İleri çarpma için özel istatistik güncelleme
        const exerciseKey = `ileriCarpma_${this.selectedNumber}`;
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // İleri çarpma sorusunun cevabını getir
    getIleriCarpmaCevabi(question) {
        const parts = question.split(' × ');
        const num1 = parseInt(parts[0]);
        const num2 = parseInt(parts[1]);
        return num1 * num2;
    }

    // İleri çarpma için tüm kombinasyonları oluştur
    generateIleriCarpmaKombinasyonlari() {
        const kombinasyonlar = [];
        // 2-9 arası sayılarla çarpma
        for (let i = 2; i <= 9; i++) {
            kombinasyonlar.push(`${this.selectedNumber} × ${i}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan ileri çarpma sorularını getir
    getHataliIleriCarpmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = `ileriCarpma_${this.selectedNumber}`;
        const ileriCarpmaStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (ileriCarpmaStats.questionHistory) {
            Object.keys(ileriCarpmaStats.questionHistory).forEach(question => {
                if (ileriCarpmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor ileri çarpma sorularını getir (büyük sayılarla)
    getZorIleriCarpmaSorulari() {
        const zorSorular = [];
        // 7, 8, 9 ile çarpma işlemleri genellikle daha zordur
        for (let i = 7; i <= 9; i++) {
            zorSorular.push(`${this.selectedNumber} × ${i}`);
        }
        return zorSorular;
    }

    // Üslü sayı seçim sayfasını göster
    showUsluSayiSecimi() {
        const mainContent = document.getElementById('main-content');
        
        let numberButtons = '';
        const numbers = [2, 3, 4, 5, 6, 7, 8, 9];
        
        numbers.forEach(number => {
            const accuracy = this.getUsluSayiAverageAccuracy(number);
            numberButtons += `
                <div class="sub-module" onclick="moduleSystem.showUsluAltModuller(${number})">
                    <div class="accuracy-badge ${this.getAccuracyColorClass(accuracy)}">${accuracy}%</div>
                    <h4>${number} Üslü Sayılar</h4>
                    <p>${number} sayısı ile üslü işlemler</p>
                </div>
            `;
        });
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('uslu')">← Alt Modüllere Dön</button>
            <h2>Üslü Sayı Seçimi</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Hangi sayı ile üslü işlem yapmak istiyorsunuz?</p>
            ${numberButtons}
        `;
    }

    // Üslü sayı ortalama doğruluk yüzdesini hesapla
    getUsluSayiAverageAccuracy(baseNumber) {
        const exerciseStats = this.userStats.exerciseStats || {};
        let totalQuestions = 0;
        let totalCorrect = 0;
        
        // Üslü cevap bulma ve üslü sayı bulma istatistiklerini topla
        const exercises = [`usluCevapBulma_${baseNumber}`, `usluSayiBulma_${baseNumber}`];
        exercises.forEach(exercise => {
            const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
            totalQuestions += stats.total;
            totalCorrect += stats.correct;
        });
        
        if (totalQuestions === 0) return 0;
        return Math.round((totalCorrect / totalQuestions) * 100);
    }

    // Üslü sayı alt modüllerini göster
    showUsluAltModuller(baseNumber) {
        this.selectedBaseNumber = baseNumber;
        const mainContent = document.getElementById('main-content');
        
        const cevapBulmaAccuracy = this.getExerciseAccuracy(`usluCevapBulma_${baseNumber}`);
        const sayiBulmaAccuracy = this.getExerciseAccuracy(`usluSayiBulma_${baseNumber}`);
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showUsluSayiSecimi()">← Sayı Seçimine Dön</button>
            <h2>${baseNumber} Üslü Sayılar</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Hangi tür üslü işlem yapmak istiyorsunuz?</p>
            
            <div class="sub-module" onclick="moduleSystem.startUsluCevapBulma(${baseNumber})">
                <div class="accuracy-badge ${this.getAccuracyColorClass(cevapBulmaAccuracy)}">${cevapBulmaAccuracy}%</div>
                <h4>Üslü Sayının Cevabını Bul</h4>
                <p>${baseNumber}^n formatında üslü sayının sonucunu bulun</p>
            </div>
            
            <div class="sub-module" onclick="moduleSystem.startUsluSayiBulma(${baseNumber})">
                <div class="accuracy-badge ${this.getAccuracyColorClass(sayiBulmaAccuracy)}">${sayiBulmaAccuracy}%</div>
                <h4>Üslü Sayıyı Bul</h4>
                <p>Verilen sayının hangi üslü sayıya ait olduğunu bulun</p>
            </div>
        `;
    }

    // Üslü cevap bulma alıştırmasını başlat
    startUsluCevapBulma(baseNumber) {
        this.selectedBaseNumber = baseNumber;
        this.currentSubModule = 'usluCevapBulma';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showUsluAltModuller(${baseNumber})">← Alt Modüllere Dön</button>
            <h2>Üslü Sayının Cevabını Bul - ${baseNumber}</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">${baseNumber}^n formatında üslü sayının sonucunu bulun</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateUsluCevapBulmaQuestion();
    }

    // Üslü sayı bulma alıştırmasını başlat
    startUsluSayiBulma(baseNumber) {
        this.selectedBaseNumber = baseNumber;
        this.currentSubModule = 'usluSayiBulma';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showUsluAltModuller(${baseNumber})">← Alt Modüllere Dön</button>
            <h2>Üslü Sayıyı Bul - ${baseNumber}</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Verilen sayının ${baseNumber}^n formatında hangi üslü sayıya ait olduğunu bulun</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateUsluSayiBulmaQuestion();
    }

    // Üslü cevap bulma sorusu üret
    generateUsluCevapBulmaQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastUsluCevapBulmaSorusu) {
            this.lastUsluCevapBulmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliUsluCevapBulmaSorulari().filter(soru => soru !== this.lastUsluCevapBulmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastUsluCevapBulmaSorusu = selectedQuestion;
            const answer = this.getUsluCevapBulmaCevabi(selectedQuestion);
            this.showUsluCevapBulmaQuestion(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorUsluCevapBulmaSorulari().filter(soru => soru !== this.lastUsluCevapBulmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastUsluCevapBulmaSorusu = selectedQuestion;
            const answer = this.getUsluCevapBulmaCevabi(selectedQuestion);
            this.showUsluCevapBulmaQuestion(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateUsluCevapBulmaKombinasyonlari().filter(soru => soru !== this.lastUsluCevapBulmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastUsluCevapBulmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateUsluCevapBulmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastUsluCevapBulmaSorusu = selectedQuestion;
            const answer = this.getUsluCevapBulmaCevabi(selectedQuestion);
            this.showUsluCevapBulmaQuestion(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastUsluCevapBulmaSorusu = selectedQuestion;
        const answer = this.getUsluCevapBulmaCevabi(selectedQuestion);
        this.showUsluCevapBulmaQuestion(selectedQuestion, answer);
    }

    // Üslü cevap bulma sorusunu göster
    showUsluCevapBulmaQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Üslü sayıyı gerçek formatta göster
        const formattedQuestion = this.formatUsluSayi(question);
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${formattedQuestion}</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Cevabınızı girin" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkUsluCevapBulmaAnswer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkUsluCevapBulmaAnswer(answer);
            }
        });
    }

    // Üslü cevap bulma cevabını kontrol et
    checkUsluCevapBulmaAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateUsluCevapBulmaStats(questionText, isCorrect);
        
        if (isCorrect) {
            input.value = '';
            
            // Direkt yeni soru üret (tebrikler mesajı yok)
            this.generateUsluCevapBulmaQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // Üslü cevap bulma istatistiklerini güncelle
    updateUsluCevapBulmaStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // Üslü cevap bulma için özel istatistik güncelleme
        const exerciseKey = `usluCevapBulma_${this.selectedBaseNumber}`;
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // Üslü cevap bulma sorusunun cevabını getir
    getUsluCevapBulmaCevabi(question) {
        const parts = question.split('^');
        const base = parseInt(parts[0]);
        const exponent = parseInt(parts[1]);
        return Math.pow(base, exponent);
    }

    // Üslü cevap bulma için tüm kombinasyonları oluştur
    generateUsluCevapBulmaKombinasyonlari() {
        const kombinasyonlar = [];
        const maxExponent = this.getMaxExponent(this.selectedBaseNumber);
        
        // 0'dan maxExponent'e kadar
        for (let i = 0; i <= maxExponent; i++) {
            kombinasyonlar.push(`${this.selectedBaseNumber}^${i}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan üslü cevap bulma sorularını getir
    getHataliUsluCevapBulmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = `usluCevapBulma_${this.selectedBaseNumber}`;
        const usluCevapBulmaStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (usluCevapBulmaStats.questionHistory) {
            Object.keys(usluCevapBulmaStats.questionHistory).forEach(question => {
                if (usluCevapBulmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor üslü cevap bulma sorularını getir (büyük üslerle)
    getZorUsluCevapBulmaSorulari() {
        const zorSorular = [];
        const maxExponent = this.getMaxExponent(this.selectedBaseNumber);
        
        // Büyük üsler genellikle daha zordur (son 3 üs)
        const startExponent = Math.max(0, maxExponent - 2);
        for (let i = startExponent; i <= maxExponent; i++) {
            zorSorular.push(`${this.selectedBaseNumber}^${i}`);
        }
        return zorSorular;
    }

    // Üslü sayı bulma sorusu üret
    generateUsluSayiBulmaQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastUsluSayiBulmaSorusu) {
            this.lastUsluSayiBulmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliUsluSayiBulmaSorulari().filter(soru => soru !== this.lastUsluSayiBulmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastUsluSayiBulmaSorusu = selectedQuestion;
            const answer = this.getUsluSayiBulmaCevabi(selectedQuestion);
            if (answer !== -1) { // Geçerli bir cevap varsa
                this.showUsluSayiBulmaQuestion(selectedQuestion, answer);
            } else {
                // Geçersiz soru, yeni soru üret
                this.generateUsluSayiBulmaQuestion();
            }
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorUsluSayiBulmaSorulari().filter(soru => soru !== this.lastUsluSayiBulmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastUsluSayiBulmaSorusu = selectedQuestion;
            const answer = this.getUsluSayiBulmaCevabi(selectedQuestion);
            if (answer !== -1) { // Geçerli bir cevap varsa
                this.showUsluSayiBulmaQuestion(selectedQuestion, answer);
            } else {
                // Geçersiz soru, yeni soru üret
                this.generateUsluSayiBulmaQuestion();
            }
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateUsluSayiBulmaKombinasyonlari().filter(soru => soru !== this.lastUsluSayiBulmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastUsluSayiBulmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateUsluSayiBulmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastUsluSayiBulmaSorusu = selectedQuestion;
            const answer = this.getUsluSayiBulmaCevabi(selectedQuestion);
            if (answer !== -1) { // Geçerli bir cevap varsa
                this.showUsluSayiBulmaQuestion(selectedQuestion, answer);
            } else {
                // Geçersiz soru, yeni soru üret
                this.generateUsluSayiBulmaQuestion();
            }
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastUsluSayiBulmaSorusu = selectedQuestion;
        const answer = this.getUsluSayiBulmaCevabi(selectedQuestion);
        if (answer !== -1) { // Geçerli bir cevap varsa
            this.showUsluSayiBulmaQuestion(selectedQuestion, answer);
        } else {
            // Geçersiz soru, yeni soru üret
            this.generateUsluSayiBulmaQuestion();
        }
    }

    // Üslü sayı bulma sorusunu göster
    showUsluSayiBulmaQuestion(question, answer) {
        try {
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Çoktan seçmeli şıklar oluştur
            const options = this.generateUsluSayiBulmaOptions(answer);
            
            // Üslü sayıyı gerçek formatta göster
            const formattedQuestion = this.formatUsluSayiBulmaQuestion(question);
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">${formattedQuestion}</div>
                    <div class="options-container">
                        ${options.map((option, index) => `
                            <button class="option-button" onclick="moduleSystem.checkUsluSayiBulmaAnswer(${option}, ${answer})">
                                ${this.formatUsluSayi(`${this.selectedBaseNumber}^${option}`)}
                            </button>
                        `).join('')}
                    </div>
                    <div id="result"></div>
                </div>
            `;
        } catch (error) {
            console.error('Üslü sayı bulma sorusu gösterilirken hata:', error);
            // Hata durumunda basit bir soru göster
            const exerciseContainer = document.getElementById('exercise-container');
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">Bir hata oluştu. Lütfen tekrar deneyin.</div>
                    <button class="check-button" onclick="moduleSystem.generateUsluSayiBulmaQuestion()">Yeni Soru</button>
                </div>
            `;
        }
    }

    // Üslü sayı bulma için şık oluştur
    generateUsluSayiBulmaOptions(correctAnswer) {
        try {
            if (correctAnswer === undefined || correctAnswer === null || correctAnswer === -1) {
                // Geçersiz cevap durumunda varsayılan şıklar
                return [0, 1, 2, 3];
            }
            
            const options = [correctAnswer];
            const maxExponent = this.getMaxExponent(this.selectedBaseNumber);
            
            // Yanlış şıklar oluştur
            while (options.length < 4) {
                let wrongOption;
                do {
                    // Doğru cevabın yakınında rastgele şık oluştur
                    if (Math.random() < 0.5) {
                        // Doğru cevabın ±2 aralığında
                        wrongOption = correctAnswer + Math.floor(Math.random() * 5) - 2;
                    } else {
                        // Tamamen rastgele
                        wrongOption = Math.floor(Math.random() * (maxExponent + 1));
                    }
                    
                    // 0 ile maxExponent arasında olmalı ve tekrar olmamalı
                    wrongOption = Math.max(0, Math.min(maxExponent, wrongOption));
                } while (options.includes(wrongOption));
                
                options.push(wrongOption);
            }
            
            // Şıkları karıştır
            return this.shuffleArray(options);
        } catch (error) {
            console.error('Üslü sayı bulma şıkları oluşturulurken hata:', error);
            return [0, 1, 2, 3]; // Varsayılan şıklar
        }
    }

    // Üslü sayı bulma cevabını kontrol et
    checkUsluSayiBulmaAnswer(userAnswer, correctAnswer) {
        const resultDiv = document.getElementById('result');
        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateUsluSayiBulmaStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateUsluSayiBulmaQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            
            // 2 saniye sonra yeni soru üret
            setTimeout(() => {
                this.generateUsluSayiBulmaQuestion();
            }, 2000);
        }
    }

    // Üslü sayı bulma istatistiklerini güncelle
    updateUsluSayiBulmaStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // Üslü sayı bulma için özel istatistik güncelleme
        const exerciseKey = `usluSayiBulma_${this.selectedBaseNumber}`;
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // Üslü sayı bulma sorusunun cevabını getir
    getUsluSayiBulmaCevabi(question) {
        try {
            const parts = question.split(' = ');
            if (parts.length < 2) {
                return -1; // Geçersiz format
            }
            
            const result = parseInt(parts[1]);
            if (isNaN(result)) {
                return -1; // Geçersiz sayı
            }
            
            const base = this.selectedBaseNumber;
            if (!base) {
                return -1; // Base number tanımlı değil
            }
            
            // Verilen sonucun hangi üsle elde edildiğini bul
            for (let i = 0; i <= this.getMaxExponent(base); i++) {
                if (Math.pow(base, i) === result) {
                    return i;
                }
            }
            return -1; // Bulunamadı
        } catch (error) {
            console.error('Üslü sayı bulma cevabı hesaplanırken hata:', error);
            return -1;
        }
    }

    // Üslü sayı bulma için tüm kombinasyonları oluştur
    generateUsluSayiBulmaKombinasyonlari() {
        const kombinasyonlar = [];
        const maxExponent = this.getMaxExponent(this.selectedBaseNumber);
        
        // 0'dan maxExponent'e kadar
        for (let i = 0; i <= maxExponent; i++) {
            const result = Math.pow(this.selectedBaseNumber, i);
            kombinasyonlar.push(`${this.selectedBaseNumber}^${i} = ${result}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan üslü sayı bulma sorularını getir
    getHataliUsluSayiBulmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = `usluSayiBulma_${this.selectedBaseNumber}`;
        const usluSayiBulmaStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (usluSayiBulmaStats.questionHistory) {
            Object.keys(usluSayiBulmaStats.questionHistory).forEach(question => {
                if (usluSayiBulmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor üslü sayı bulma sorularını getir (büyük üslerle)
    getZorUsluSayiBulmaSorulari() {
        const zorSorular = [];
        const maxExponent = this.getMaxExponent(this.selectedBaseNumber);
        
        // Büyük üsler genellikle daha zordur (son 3 üs)
        const startExponent = Math.max(0, maxExponent - 2);
        for (let i = startExponent; i <= maxExponent; i++) {
            const result = Math.pow(this.selectedBaseNumber, i);
            zorSorular.push(`${this.selectedBaseNumber}^${i} = ${result}`);
        }
        return zorSorular;
    }

    // Maksimum üs değerini getir
    getMaxExponent(baseNumber) {
        const maxExponents = {
            2: 10,  // 2^0 to 2^10
            3: 6,   // 3^0 to 3^6
            4: 5,   // 4^0 to 4^5
            5: 4,   // 5^0 to 5^4
            6: 3,   // 6^0 to 6^3
            7: 3,   // 7^0 to 7^3
            8: 3,   // 8^0 to 8^3
            9: 3    // 9^0 to 9^3
        };
        return maxExponents[baseNumber] || 3;
    }

    // Karesini alma alt modüllerini göster
    showKaresiniAlmaAltModuller() {
        const mainContent = document.getElementById('main-content');
        
        const kareCevapBulmaAccuracy = this.getExerciseAccuracy('kareCevapBulma');
        const kareSayiBulmaAccuracy = this.getExerciseAccuracy('kareSayiBulma');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('uslu')">← Alt Modüllere Dön</button>
            <h2>Karesini Alma</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Hangi tür kare işlemi yapmak istiyorsunuz?</p>
            
            <div class="sub-module" onclick="moduleSystem.startKareCevapBulma()">
                <div class="accuracy-badge ${this.getAccuracyColorClass(kareCevapBulmaAccuracy)}">${kareCevapBulmaAccuracy}%</div>
                <h4>Kare Sonucunu Bul</h4>
                <p>11-20 arası sayının karesini hesaplayın</p>
            </div>
            
            <div class="sub-module" onclick="moduleSystem.startKareSayiBulma()">
                <div class="accuracy-badge ${this.getAccuracyColorClass(kareSayiBulmaAccuracy)}">${kareSayiBulmaAccuracy}%</div>
                <h4>Kare Sayısını Bul</h4>
                <p>Verilen sonucun hangi sayının karesi olduğunu bulun</p>
            </div>
        `;
    }

    // Kare cevap bulma alıştırmasını başlat
    startKareCevapBulma() {
        this.currentSubModule = 'kareCevapBulma';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showKaresiniAlmaAltModuller()">← Alt Modüllere Dön</button>
            <h2>Kare Sonucunu Bul</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">11-20 arası sayının karesini hesaplayın</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateKareCevapBulmaQuestion();
    }

    // Kare sayı bulma alıştırmasını başlat
    startKareSayiBulma() {
        this.currentSubModule = 'kareSayiBulma';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showKaresiniAlmaAltModuller()">← Alt Modüllere Dön</button>
            <h2>Kare Sayısını Bul</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Verilen sonucun hangi sayının karesi olduğunu bulun</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateKareSayiBulmaQuestion();
    }

    // Kare cevap bulma sorusu üret
    generateKareCevapBulmaQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastKareCevapBulmaSorusu) {
            this.lastKareCevapBulmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliKareCevapBulmaSorulari().filter(soru => soru !== this.lastKareCevapBulmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastKareCevapBulmaSorusu = selectedQuestion;
            const answer = this.getKareCevapBulmaCevabi(selectedQuestion);
            this.showKareCevapBulmaQuestion(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorKareCevapBulmaSorulari().filter(soru => soru !== this.lastKareCevapBulmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastKareCevapBulmaSorusu = selectedQuestion;
            const answer = this.getKareCevapBulmaCevabi(selectedQuestion);
            this.showKareCevapBulmaQuestion(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateKareCevapBulmaKombinasyonlari().filter(soru => soru !== this.lastKareCevapBulmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastKareCevapBulmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateKareCevapBulmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastKareCevapBulmaSorusu = selectedQuestion;
            const answer = this.getKareCevapBulmaCevabi(selectedQuestion);
            this.showKareCevapBulmaQuestion(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastKareCevapBulmaSorusu = selectedQuestion;
        const answer = this.getKareCevapBulmaCevabi(selectedQuestion);
        this.showKareCevapBulmaQuestion(selectedQuestion, answer);
    }

    // Kare cevap bulma sorusunu göster
    showKareCevapBulmaQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Kare formatını gerçek matematiksel formatta göster
        const formattedQuestion = this.formatKareSorusu(question);
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${formattedQuestion}</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Cevabınızı girin" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkKareCevapBulmaAnswer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkKareCevapBulmaAnswer(answer);
            }
        });
    }

    // Kare cevap bulma cevabını kontrol et
    checkKareCevapBulmaAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateKareCevapBulmaStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateKareCevapBulmaQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // Kare cevap bulma istatistiklerini güncelle
    updateKareCevapBulmaStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // Kare cevap bulma için özel istatistik güncelleme
        const exerciseKey = 'kareCevapBulma';
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // Kare cevap bulma sorusunun cevabını getir
    getKareCevapBulmaCevabi(question) {
        const parts = question.split('²');
        const base = parseInt(parts[0]);
        return base * base;
    }

    // Kare cevap bulma için tüm kombinasyonları oluştur
    generateKareCevapBulmaKombinasyonlari() {
        const kombinasyonlar = [];
        
        // 11-20 arası sayıların kareleri
        for (let i = 11; i <= 20; i++) {
            kombinasyonlar.push(`${i}²`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan kare cevap bulma sorularını getir
    getHataliKareCevapBulmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kareCevapBulma';
        const kareCevapBulmaStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kareCevapBulmaStats.questionHistory) {
            Object.keys(kareCevapBulmaStats.questionHistory).forEach(question => {
                if (kareCevapBulmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kare cevap bulma sorularını getir (büyük sayılarla)
    getZorKareCevapBulmaSorulari() {
        const zorSorular = [];
        // 18, 19, 20 ile kare alma işlemleri genellikle daha zordur
        for (let i = 18; i <= 20; i++) {
            zorSorular.push(`${i}²`);
        }
        return zorSorular;
    }

    // Kare sayı bulma sorusu üret
    generateKareSayiBulmaQuestion() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastKareSayiBulmaSorusu) {
            this.lastKareSayiBulmaSorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliKareSayiBulmaSorulari().filter(soru => soru !== this.lastKareSayiBulmaSorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastKareSayiBulmaSorusu = selectedQuestion;
            const answer = this.getKareSayiBulmaCevabi(selectedQuestion);
            this.showKareSayiBulmaQuestion(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorKareSayiBulmaSorulari().filter(soru => soru !== this.lastKareSayiBulmaSorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastKareSayiBulmaSorusu = selectedQuestion;
            const answer = this.getKareSayiBulmaCevabi(selectedQuestion);
            this.showKareSayiBulmaQuestion(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateKareSayiBulmaKombinasyonlari().filter(soru => soru !== this.lastKareSayiBulmaSorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastKareSayiBulmaSorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateKareSayiBulmaKombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastKareSayiBulmaSorusu = selectedQuestion;
            const answer = this.getKareSayiBulmaCevabi(selectedQuestion);
            this.showKareSayiBulmaQuestion(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastKareSayiBulmaSorusu = selectedQuestion;
        const answer = this.getKareSayiBulmaCevabi(selectedQuestion);
        this.showKareSayiBulmaQuestion(selectedQuestion, answer);
    }

    // Kare sayı bulma sorusunu göster
    showKareSayiBulmaQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question} sayısı hangi sayının karesidir?</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Sayıyı girin (11-20 arası)" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkKareSayiBulmaAnswer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkKareSayiBulmaAnswer(answer);
            }
        });
    }

    // Kare sayı bulma cevabını kontrol et
    checkKareSayiBulmaAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        if (userAnswer < 11 || userAnswer > 20) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen 11-20 arası bir sayı girin!</div>';
            input.value = '';
            input.focus();
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateKareSayiBulmaStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateKareSayiBulmaQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // Kare sayı bulma istatistiklerini güncelle
    updateKareSayiBulmaStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // Kare sayı bulma için özel istatistik güncelleme
        const exerciseKey = 'kareSayiBulma';
        
        if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
        if (!this.userStats.exerciseStats[exerciseKey]) {
            this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
        }
        
        this.userStats.exerciseStats[exerciseKey].total++;
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].correct++;
        }
        
        // Detaylı soru geçmişi tut
        if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
        } else {
            this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // Kare sayı bulma sorusunun cevabını getir
    getKareSayiBulmaCevabi(question) {
        const result = parseInt(question);
        
        // Verilen sonucun hangi sayının karesi olduğunu bul
        for (let i = 11; i <= 20; i++) {
            if (i * i === result) {
                return i;
            }
        }
        return -1; // Bulunamadı
    }

    // Kare sayı bulma için tüm kombinasyonları oluştur
    generateKareSayiBulmaKombinasyonlari() {
        const kombinasyonlar = [];
        
        // 11-20 arası sayıların kareleri
        for (let i = 11; i <= 20; i++) {
            const result = i * i;
            kombinasyonlar.push(`${result}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan kare sayı bulma sorularını getir
    getHataliKareSayiBulmaSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kareSayiBulma';
        const kareSayiBulmaStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kareSayiBulmaStats.questionHistory) {
            Object.keys(kareSayiBulmaStats.questionHistory).forEach(question => {
                if (kareSayiBulmaStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kare sayı bulma sorularını getir (büyük sayılarla)
    getZorKareSayiBulmaSorulari() {
        const zorSorular = [];
        // 18, 19, 20 ile kare alma işlemleri genellikle daha zordur
        for (let i = 18; i <= 20; i++) {
            const result = i * i;
            zorSorular.push(`${result}`);
        }
        return zorSorular;
    }

    // Kare sorusunu formatla
    formatKareSorusu(question) {
        return `<span style="font-size: 1.3em; font-weight: bold;">${question}</span> kaçtır?`;
    }

    // Faktöriyel hesaplama fonksiyonu
    faktoriyelHesapla(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Faktöriyel cevap bulma 1 (1-6!) alıştırmasını başlat
    startFaktoriyelCevapBulma1() {
        this.currentSubModule = 'faktoriyelCevapBulma1';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('faktoriyel')">← Alt Modüllere Dön</button>
            <h2>Faktöriyel Cevap Bulma (1-6!)</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">1! ile 6! arası faktöriyellerin sonucunu hesaplayın</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateFaktoriyelCevapBulma1Question();
    }

    // Faktöriyel cevap bulma 2 (7-10!) alıştırmasını başlat
    startFaktoriyelCevapBulma2() {
        this.currentSubModule = 'faktoriyelCevapBulma2';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('faktoriyel')">← Alt Modüllere Dön</button>
            <h2>Faktöriyel Cevap Bulma (7-10!)</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">7! ile 10! arası faktöriyellerin sonucunu hesaplayın</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateFaktoriyelCevapBulma2Question();
    }

    // Faktöriyel sayı bulma 1 (1-6!) alıştırmasını başlat
    startFaktoriyelSayiBulma1() {
        this.currentSubModule = 'faktoriyelSayiBulma1';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('faktoriyel')">← Alt Modüllere Dön</button>
            <h2>Faktöriyel Sayı Bulma (1-6!)</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Verilen sonucun hangi faktöriyel olduğunu bulun</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateFaktoriyelSayiBulma1Question();
    }

    // Faktöriyel sayı bulma 2 (7-10!) alıştırmasını başlat
    startFaktoriyelSayiBulma2() {
        this.currentSubModule = 'faktoriyelSayiBulma2';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('faktoriyel')">← Alt Modüllere Dön</button>
            <h2>Faktöriyel Sayı Bulma (7-10!)</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Verilen sonucun hangi faktöriyel olduğunu bulun</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateFaktoriyelSayiBulma2Question();
    }

    // Faktöriyel cevap bulma 1 (1-6!) sorusu üret
    generateFaktoriyelCevapBulma1Question() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastFaktoriyelCevapBulma1Sorusu) {
            this.lastFaktoriyelCevapBulma1Sorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliFaktoriyelCevapBulma1Sorulari().filter(soru => soru !== this.lastFaktoriyelCevapBulma1Sorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastFaktoriyelCevapBulma1Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelCevapBulma1Cevabi(selectedQuestion);
            this.showFaktoriyelCevapBulma1Question(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorFaktoriyelCevapBulma1Sorulari().filter(soru => soru !== this.lastFaktoriyelCevapBulma1Sorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastFaktoriyelCevapBulma1Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelCevapBulma1Cevabi(selectedQuestion);
            this.showFaktoriyelCevapBulma1Question(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateFaktoriyelCevapBulma1Kombinasyonlari().filter(soru => soru !== this.lastFaktoriyelCevapBulma1Sorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastFaktoriyelCevapBulma1Sorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateFaktoriyelCevapBulma1Kombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastFaktoriyelCevapBulma1Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelCevapBulma1Cevabi(selectedQuestion);
            this.showFaktoriyelCevapBulma1Question(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastFaktoriyelCevapBulma1Sorusu = selectedQuestion;
        const answer = this.getFaktoriyelCevapBulma1Cevabi(selectedQuestion);
        this.showFaktoriyelCevapBulma1Question(selectedQuestion, answer);
    }

    // Faktöriyel cevap bulma 1 (1-6!) sorusunu göster
    showFaktoriyelCevapBulma1Question(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question} kaçtır?</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Cevabınızı girin" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkFaktoriyelCevapBulma1Answer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkFaktoriyelCevapBulma1Answer(answer);
            }
        });
    }

    // Faktöriyel cevap bulma 1 (1-6!) cevabını kontrol et
    checkFaktoriyelCevapBulma1Answer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateFaktoriyelCevapBulma1Question();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }



    // Faktöriyel cevap bulma 1 (1-6!) sorusunun cevabını getir
    getFaktoriyelCevapBulma1Cevabi(question) {
        const parts = question.split('!');
        const n = parseInt(parts[0]);
        return this.faktoriyelHesapla(n);
    }

    // Faktöriyel cevap bulma 1 (1-6!) için tüm kombinasyonları oluştur
    generateFaktoriyelCevapBulma1Kombinasyonlari() {
        const kombinasyonlar = [];
        
        // 1! ile 6! arası faktöriyeller
        for (let i = 1; i <= 6; i++) {
            kombinasyonlar.push(`${i}!`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan faktöriyel cevap bulma 1 (1-6!) sorularını getir
    getHataliFaktoriyelCevapBulma1Sorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'faktoriyelCevapBulma1';
        const faktoriyelCevapBulma1Stats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (faktoriyelCevapBulma1Stats.questionHistory) {
            Object.keys(faktoriyelCevapBulma1Stats.questionHistory).forEach(question => {
                if (faktoriyelCevapBulma1Stats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor faktöriyel cevap bulma 1 (1-6!) sorularını getir (büyük sayılarla)
    getZorFaktoriyelCevapBulma1Sorulari() {
        const zorSorular = [];
        // 5! ve 6! ile faktöriyel işlemleri genellikle daha zordur
        for (let i = 5; i <= 6; i++) {
            zorSorular.push(`${i}!`);
        }
        return zorSorular;
    }

    // Faktöriyel cevap bulma 2 (7-10!) sorusu üret
    generateFaktoriyelCevapBulma2Question() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastFaktoriyelCevapBulma2Sorusu) {
            this.lastFaktoriyelCevapBulma2Sorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliFaktoriyelCevapBulma2Sorulari().filter(soru => soru !== this.lastFaktoriyelCevapBulma2Sorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastFaktoriyelCevapBulma2Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelCevapBulma2Cevabi(selectedQuestion);
            this.showFaktoriyelCevapBulma2Question(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorFaktoriyelCevapBulma2Sorulari().filter(soru => soru !== this.lastFaktoriyelCevapBulma2Sorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastFaktoriyelCevapBulma2Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelCevapBulma2Cevabi(selectedQuestion);
            this.showFaktoriyelCevapBulma2Question(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateFaktoriyelCevapBulma2Kombinasyonlari().filter(soru => soru !== this.lastFaktoriyelCevapBulma2Sorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastFaktoriyelCevapBulma2Sorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateFaktoriyelCevapBulma2Kombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastFaktoriyelCevapBulma2Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelCevapBulma2Cevabi(selectedQuestion);
            this.showFaktoriyelCevapBulma2Question(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastFaktoriyelCevapBulma2Sorusu = selectedQuestion;
        const answer = this.getFaktoriyelCevapBulma2Cevabi(selectedQuestion);
        this.showFaktoriyelCevapBulma2Question(selectedQuestion, answer);
    }

    // Faktöriyel cevap bulma 2 (7-10!) sorusunu göster
    showFaktoriyelCevapBulma2Question(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question} kaçtır?</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Cevabınızı girin" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkFaktoriyelCevapBulma2Answer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkFaktoriyelCevapBulma2Answer(answer);
            }
        });
    }

    // Faktöriyel cevap bulma 2 (7-10!) cevabını kontrol et
    checkFaktoriyelCevapBulma2Answer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateFaktoriyelCevapBulma2Question();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }



    // Faktöriyel cevap bulma 2 (7-10!) sorusunun cevabını getir
    getFaktoriyelCevapBulma2Cevabi(question) {
        const parts = question.split('!');
        const n = parseInt(parts[0]);
        return this.faktoriyelHesapla(n);
    }

    // Faktöriyel cevap bulma 2 (7-10!) için tüm kombinasyonları oluştur
    generateFaktoriyelCevapBulma2Kombinasyonlari() {
        const kombinasyonlar = [];
        
        // 7! ile 10! arası faktöriyeller
        for (let i = 7; i <= 10; i++) {
            kombinasyonlar.push(`${i}!`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan faktöriyel cevap bulma 2 (7-10!) sorularını getir
    getHataliFaktoriyelCevapBulma2Sorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'faktoriyelCevapBulma2';
        const faktoriyelCevapBulma2Stats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (faktoriyelCevapBulma2Stats.questionHistory) {
            Object.keys(faktoriyelCevapBulma2Stats.questionHistory).forEach(question => {
                if (faktoriyelCevapBulma2Stats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor faktöriyel cevap bulma 2 (7-10!) sorularını getir (büyük sayılarla)
    getZorFaktoriyelCevapBulma2Sorulari() {
        const zorSorular = [];
        // 9! ve 10! ile faktöriyel işlemleri genellikle daha zordur
        for (let i = 9; i <= 10; i++) {
            zorSorular.push(`${i}!`);
        }
        return zorSorular;
    }

    // Faktöriyel sayı bulma 1 (1-6!) sorusu üret
    generateFaktoriyelSayiBulma1Question() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastFaktoriyelSayiBulma1Sorusu) {
            this.lastFaktoriyelSayiBulma1Sorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliFaktoriyelSayiBulma1Sorulari().filter(soru => soru !== this.lastFaktoriyelSayiBulma1Sorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastFaktoriyelSayiBulma1Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelSayiBulma1Cevabi(selectedQuestion);
            this.showFaktoriyelSayiBulma1Question(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorFaktoriyelSayiBulma1Sorulari().filter(soru => soru !== this.lastFaktoriyelSayiBulma1Sorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastFaktoriyelSayiBulma1Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelSayiBulma1Cevabi(selectedQuestion);
            this.showFaktoriyelSayiBulma1Question(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateFaktoriyelSayiBulma1Kombinasyonlari().filter(soru => soru !== this.lastFaktoriyelSayiBulma1Sorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastFaktoriyelSayiBulma1Sorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateFaktoriyelSayiBulma1Kombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastFaktoriyelSayiBulma1Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelSayiBulma1Cevabi(selectedQuestion);
            this.showFaktoriyelSayiBulma1Question(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastFaktoriyelSayiBulma1Sorusu = selectedQuestion;
        const answer = this.getFaktoriyelSayiBulma1Cevabi(selectedQuestion);
        this.showFaktoriyelSayiBulma1Question(selectedQuestion, answer);
    }

    // Faktöriyel sayı bulma 1 (1-6!) sorusunu göster
    showFaktoriyelSayiBulma1Question(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question} sayısı hangi faktöriyelin sonucudur?</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Faktöriyel sayısını girin (1-6 arası)" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkFaktoriyelSayiBulma1Answer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkFaktoriyelSayiBulma1Answer(answer);
            }
        });
    }

    // Faktöriyel sayı bulma 1 (1-6!) cevabını kontrol et
    checkFaktoriyelSayiBulma1Answer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateFaktoriyelSayiBulma1Question();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }



    // Faktöriyel sayı bulma 1 (1-6!) sorusunun cevabını getir
    getFaktoriyelSayiBulma1Cevabi(question) {
        const result = parseInt(question);
        
        // Verilen sonucun hangi faktöriyel olduğunu bul
        for (let i = 1; i <= 6; i++) {
            if (this.faktoriyelHesapla(i) === result) {
                return i;
            }
        }
        return 0; // Bulunamadı
    }

    // Faktöriyel sayı bulma 1 (1-6!) için tüm kombinasyonları oluştur
    generateFaktoriyelSayiBulma1Kombinasyonlari() {
        const kombinasyonlar = [];
        
        // 1! ile 6! arası faktöriyellerin sonuçları
        for (let i = 1; i <= 6; i++) {
            const result = this.faktoriyelHesapla(i);
            kombinasyonlar.push(`${result}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan faktöriyel sayı bulma 1 (1-6!) sorularını getir
    getHataliFaktoriyelSayiBulma1Sorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'faktoriyelSayiBulma1';
        const faktoriyelSayiBulma1Stats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (faktoriyelSayiBulma1Stats.questionHistory) {
            Object.keys(faktoriyelSayiBulma1Stats.questionHistory).forEach(question => {
                if (faktoriyelSayiBulma1Stats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor faktöriyel sayı bulma 1 (1-6!) sorularını getir (büyük sayılarla)
    getZorFaktoriyelSayiBulma1Sorulari() {
        const zorSorular = [];
        // 5! ve 6! ile faktöriyel işlemleri genellikle daha zordur
        for (let i = 5; i <= 6; i++) {
            const result = this.faktoriyelHesapla(i);
            zorSorular.push(`${result}`);
        }
        return zorSorular;
    }

    // Faktöriyel sayı bulma 2 (7-10!) sorusu üret
    generateFaktoriyelSayiBulma2Question() {
        const exerciseContainer = document.getElementById('exercise-container');
        
        // Son sorulan soruyu hatırla
        if (!this.lastFaktoriyelSayiBulma2Sorusu) {
            this.lastFaktoriyelSayiBulma2Sorusu = '';
        }

        // Hata yapılan soruları öncelikle sor (son sorulan hariç)
        const hataliSorular = this.getHataliFaktoriyelSayiBulma2Sorulari().filter(soru => soru !== this.lastFaktoriyelSayiBulma2Sorusu);
        if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
            const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
            this.lastFaktoriyelSayiBulma2Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelSayiBulma2Cevabi(selectedQuestion);
            this.showFaktoriyelSayiBulma2Question(selectedQuestion, answer);
            return;
        }

        // Zor soruları daha sık sor (son sorulan hariç)
        const zorSorular = this.getZorFaktoriyelSayiBulma2Sorulari().filter(soru => soru !== this.lastFaktoriyelSayiBulma2Sorusu);
        if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
            const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
            this.lastFaktoriyelSayiBulma2Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelSayiBulma2Cevabi(selectedQuestion);
            this.showFaktoriyelSayiBulma2Question(selectedQuestion, answer);
            return;
        }

        // Normal rastgele soru (son sorulan hariç)
        const availableQuestions = this.generateFaktoriyelSayiBulma2Kombinasyonlari().filter(soru => soru !== this.lastFaktoriyelSayiBulma2Sorusu);
        
        // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
        if (availableQuestions.length === 0) {
            this.lastFaktoriyelSayiBulma2Sorusu = '';
            const shuffledKombinasyonlar = this.shuffleArray([...this.generateFaktoriyelSayiBulma2Kombinasyonlari()]);
            const selectedQuestion = shuffledKombinasyonlar[0];
            this.lastFaktoriyelSayiBulma2Sorusu = selectedQuestion;
            const answer = this.getFaktoriyelSayiBulma2Cevabi(selectedQuestion);
            this.showFaktoriyelSayiBulma2Question(selectedQuestion, answer);
            return;
        }
        
        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.lastFaktoriyelSayiBulma2Sorusu = selectedQuestion;
        const answer = this.getFaktoriyelSayiBulma2Cevabi(selectedQuestion);
        this.showFaktoriyelSayiBulma2Question(selectedQuestion, answer);
    }

    // Faktöriyel sayı bulma 2 (7-10!) sorusunu göster
    showFaktoriyelSayiBulma2Question(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${question} sayısı hangi faktöriyelin sonucudur?</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Faktöriyel sayısını girin (7-10 arası)" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkFaktoriyelSayiBulma2Answer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkFaktoriyelSayiBulma2Answer(answer);
            }
        });
    }

    // Faktöriyel sayı bulma 2 (7-10!) cevabını kontrol et
    checkFaktoriyelSayiBulma2Answer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateFaktoriyelSayiBulma2Question();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <div>
                        <small>Tekrar deneyin!</small>
                    </div>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }



    // Faktöriyel sayı bulma 2 (7-10!) sorusunun cevabını getir
    getFaktoriyelSayiBulma2Cevabi(question) {
        const result = parseInt(question);
        
        // Verilen sonucun hangi faktöriyel olduğunu bul
        for (let i = 7; i <= 10; i++) {
            if (this.faktoriyelHesapla(i) === result) {
                return i;
            }
        }
        return 0; // Bulunamadı
    }

    // Faktöriyel sayı bulma 2 (7-10!) için tüm kombinasyonları oluştur
    generateFaktoriyelSayiBulma2Kombinasyonlari() {
        const kombinasyonlar = [];
        
        // 7! ile 10! arası faktöriyellerin sonuçları
        for (let i = 7; i <= 10; i++) {
            const result = this.faktoriyelHesapla(i);
            kombinasyonlar.push(`${result}`);
        }
        return kombinasyonlar;
    }

    // Hata yapılan faktöriyel sayı bulma 2 (7-10!) sorularını getir
    getHataliFaktoriyelSayiBulma2Sorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'faktoriyelSayiBulma2';
        const faktoriyelSayiBulma2Stats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (faktoriyelSayiBulma2Stats.questionHistory) {
            Object.keys(faktoriyelSayiBulma2Stats.questionHistory).forEach(question => {
                if (faktoriyelSayiBulma2Stats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor faktöriyel sayı bulma 2 (7-10!) sorularını getir (büyük sayılarla)
    getZorFaktoriyelSayiBulma2Sorulari() {
        const zorSorular = [];
        // 9! ve 10! ile faktöriyel işlemleri genellikle daha zordur
        for (let i = 9; i <= 10; i++) {
            const result = this.faktoriyelHesapla(i);
            zorSorular.push(`${result}`);
        }
        return zorSorular;
    }

    // Kesirli yüzde alıştırmasını başlat
    startKesirliYuzde() {
        this.currentSubModule = 'kesirliYuzde';
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
            <h2>Kesirli İfadelerin Yüzde Karşılığı</h2>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">Kesirli ifadelerin yüzde kaça denk geldiğini hesaplayın</p>
            <div id="exercise-container">
                <!-- Alıştırma buraya gelecek -->
            </div>
        `;

        this.generateKesirliYuzdeQuestion();
    }

    // Kesirli yüzde sorusu üret
    generateKesirliYuzdeQuestion() {
        try {
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastKesirliYuzdeSorusu) {
                this.lastKesirliYuzdeSorusu = '';
            }

            // Hata yapılan soruları öncelikle sor (son sorulan hariç)
            const hataliSorular = this.getHataliKesirliYuzdeSorulari().filter(soru => soru !== this.lastKesirliYuzdeSorusu);
            if (hataliSorular.length > 0 && Math.random() < 0.6) { // %60 ihtimalle hatalı soruları sor
                const selectedQuestion = hataliSorular[Math.floor(Math.random() * hataliSorular.length)];
                this.lastKesirliYuzdeSorusu = selectedQuestion;
                const answer = this.getKesirliYuzdeCevabi(selectedQuestion);
                if (answer > 0) {
                    this.showKesirliYuzdeQuestion(selectedQuestion, answer);
                    return;
                }
            }

            // Zor soruları daha sık sor (son sorulan hariç)
            const zorSorular = this.getZorKesirliYuzdeSorulari().filter(soru => soru !== this.lastKesirliYuzdeSorusu);
            if (zorSorular.length > 0 && Math.random() < 0.4) { // %40 ihtimalle zor soruları sor
                const selectedQuestion = zorSorular[Math.floor(Math.random() * zorSorular.length)];
                this.lastKesirliYuzdeSorusu = selectedQuestion;
                const answer = this.getKesirliYuzdeCevabi(selectedQuestion);
                if (answer > 0) {
                    this.showKesirliYuzdeQuestion(selectedQuestion, answer);
                    return;
                }
            }

            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateKesirliYuzdeKombinasyonlari().filter(soru => soru !== this.lastKesirliYuzdeSorusu);
            
            // Eğer hiç soru kalmadıysa, son soruyu sıfırla ve yeni kombinasyonlar oluştur
            if (availableQuestions.length === 0) {
                this.lastKesirliYuzdeSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateKesirliYuzdeKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastKesirliYuzdeSorusu = selectedQuestion;
                const answer = this.getKesirliYuzdeCevabi(selectedQuestion);
                if (answer > 0) {
                    this.showKesirliYuzdeQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastKesirliYuzdeSorusu = selectedQuestion;
            const answer = this.getKesirliYuzdeCevabi(selectedQuestion);
            if (answer > 0) {
                this.showKesirliYuzdeQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda yeni soru üret
                this.lastKesirliYuzdeSorusu = '';
                this.generateKesirliYuzdeQuestion();
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda yeni soru üret
            this.lastKesirliYuzdeSorusu = '';
            this.generateKesirliYuzdeQuestion();
        }
    }

    // Kesirli yüzde sorusunu göster
    showKesirliYuzdeQuestion(question, answer) {
        const exerciseContainer = document.getElementById('exercise-container');
        
        exerciseContainer.innerHTML = `
            <div class="question-container">
                <div class="question">${this.formatKesir(question)} kesri yüzde kaça denk gelir?</div>
                <input type="number" id="answer-input" class="answer-input" placeholder="Yüzde değerini girin (0-100 arası)" autocomplete="off">
                <br>
                <button class="check-button" onclick="moduleSystem.checkKesirliYuzdeAnswer(${answer})">Kontrol Et</button>
                <div id="result"></div>
            </div>
        `;

        // Enter tuşu ile cevap verme
        const input = document.getElementById('answer-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkKesirliYuzdeAnswer(answer);
            }
        });
    }

    // Kesirli yüzde cevabını kontrol et
    checkKesirliYuzdeAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = parseInt(input.value);
            const resultDiv = document.getElementById('result');
            
            if (isNaN(userAnswer)) {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
                return;
            }

            if (correctAnswer === 0) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            const isCorrect = userAnswer === correctAnswer;
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                this.generateKesirliYuzdeQuestion();
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: %${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Kesirli yüzde sorusunun cevabını getir
    getKesirliYuzdeCevabi(question) {
        try {
            const parts = question.split('/');
            if (parts.length !== 2) {
                console.error('Geçersiz kesir formatı:', question);
                return 0;
            }
            
            const pay = parseInt(parts[0]);
            const payda = parseInt(parts[1]);
            
            if (isNaN(pay) || isNaN(payda) || payda === 0) {
                console.error('Geçersiz pay veya payda:', question);
                return 0;
            }
            
            const yuzde = Math.round((pay / payda) * 100);
            return yuzde;
        } catch (error) {
            console.error('Kesir hesaplama hatası:', error, question);
            return 0;
        }
    }

    // Kesirli yüzde için tüm kombinasyonları oluştur
    generateKesirliYuzdeKombinasyonlari() {
        const kombinasyonlar = [
            '1/2', '1/3', '1/4', '1/5', '1/8', '1/10', '1/20',
            '2/3', '2/5', '3/4', '3/5', '3/8', '4/5'
        ];
        return kombinasyonlar;
    }

    // Hata yapılan kesirli yüzde sorularını getir
    getHataliKesirliYuzdeSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kesirliYuzde';
        const kesirliYuzdeStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kesirliYuzdeStats.questionHistory) {
            Object.keys(kesirliYuzdeStats.questionHistory).forEach(question => {
                if (kesirliYuzdeStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kesirli yüzde sorularını getir (karmaşık kesirler)
    getZorKesirliYuzdeSorulari() {
        const zorSorular = ['1/8', '1/20', '3/8']; // Bu kesirler genellikle daha zordur
        return zorSorular;
    }

    // Kesri matematiksel formatta göster (pay/payda)
    formatKesir(kesir) {
        const parts = kesir.split('/');
        const pay = parts[0];
        const payda = parts[1];
        return `<span class="kesir-container">
            <div class="kesir-pay">${pay}</div>
            <div class="kesir-cizgi"></div>
            <div class="kesir-payda">${payda}</div>
        </span>`;
    }

    // Yüzdeli kesir alıştırmasını başlat
    startYuzdeliKesir() {
        try {
            console.log('Yüzdeli kesir alıştırması başlatılıyor...');
            this.currentSubModule = 'yuzdeliKesir';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
                <h2>Yüzdeli İfadelerin Kesir Karşılığı</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">Yüzde değerlerinin hangi kesire denk geldiğini bulun</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateYuzdeliKesirQuestion();
        } catch (error) {
            console.error('startYuzdeliKesir hatası:', error);
        }
    }

    // Yüzdeli kesir sorusu üret
    generateYuzdeliKesirQuestion() {
        try {
            console.log('generateYuzdeliKesirQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastYuzdeliKesirSorusu) {
                this.lastYuzdeliKesirSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateYuzdeliKesirKombinasyonlari().filter(soru => soru !== this.lastYuzdeliKesirSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastYuzdeliKesirSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateYuzdeliKesirKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastYuzdeliKesirSorusu = selectedQuestion;
                const answer = this.getYuzdeliKesirCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer) {
                    this.showYuzdeliKesirQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastYuzdeliKesirSorusu = selectedQuestion;
            const answer = this.getYuzdeliKesirCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer) {
                this.showYuzdeliKesirQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showYuzdeliKesirQuestion('50', '1/2');
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showYuzdeliKesirQuestion('50', '1/2');
        }
    }

    // Yüzdeli kesir sorusunu göster
    showYuzdeliKesirQuestion(question, answer) {
        try {
            console.log('showYuzdeliKesirQuestion başladı:', question, answer);
            const exerciseContainer = document.getElementById('exercise-container');
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">%${question} yüzdesi hangi kesire denk gelir?</div>
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin-bottom: 10px;">Cevabınızı aşağıdaki formatta girin:</p>
                        <div style="display: inline-block; margin: 0 10px;">
                            <span class="kesir-container">
                                <div class="kesir-pay">1</div>
                                <div class="kesir-cizgi"></div>
                                <div class="kesir-payda">2</div>
                            </span>
                        </div>
                        <p style="color: #666; font-size: 0.9rem;">Örnek: 1/2, 3/4, 2/5</p>
                    </div>
                    <input type="text" id="answer-input" class="answer-input" placeholder="Kesri girin (örn: 1/2)" autocomplete="off">
                    <br>
                    <button class="check-button" onclick="moduleSystem.checkYuzdeliKesirAnswer('${answer}')">Kontrol Et</button>
                    <div id="result"></div>
                </div>
            `;

            console.log('HTML yüklendi, input focus yapılıyor...');
            // Enter tuşu ile cevap verme
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkYuzdeliKesirAnswer(answer);
                }
            });
            console.log('showYuzdeliKesirQuestion tamamlandı');
        } catch (error) {
            console.error('showYuzdeliKesirQuestion hatası:', error);
        }
    }

    // Yüzdeli kesir cevabını kontrol et
    checkYuzdeliKesirAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = input.value.trim();
            const resultDiv = document.getElementById('result');
            
            if (!userAnswer) {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen bir cevap girin!</div>';
                return;
            }

            if (!correctAnswer) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            const isCorrect = userAnswer === correctAnswer;
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                this.generateYuzdeliKesirQuestion();
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: ${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Yüzdeli kesir sorusunun cevabını getir
    getYuzdeliKesirCevabi(question) {
        try {
            const yuzde = parseInt(question);
            
            if (isNaN(yuzde)) {
                console.error('Geçersiz yüzde değeri:', question);
                return null;
            }
            
            // Verilen yüzdenin hangi kesire denk geldiğini bul
            const kesirler = [
                '1/2', '1/3', '1/4', '1/5', '1/8', '1/10', '1/20',
                '2/3', '2/5', '3/4', '3/5', '3/8', '4/5'
            ];
            
            for (const kesir of kesirler) {
                const parts = kesir.split('/');
                const pay = parseInt(parts[0]);
                const payda = parseInt(parts[1]);
                const kesirYuzdesi = Math.round((pay / payda) * 100);
                
                if (kesirYuzdesi === yuzde) {
                    return kesir;
                }
            }
            
            console.error('Yüzde için kesir bulunamadı:', yuzde);
            return null;
        } catch (error) {
            console.error('Kesir hesaplama hatası:', error, question);
            return null;
        }
    }

    // Yüzdeli kesir için tüm kombinasyonları oluştur (yüzde değerleri)
    generateYuzdeliKesirKombinasyonlari() {
        const kombinasyonlar = [
            '50', '33', '25', '20', '12', '10', '5',
            '67', '40', '75', '60', '37', '80'
        ];
        return kombinasyonlar;
    }

    // Hata yapılan yüzdeli kesir sorularını getir
    getHataliYuzdeliKesirSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'yuzdeliKesir';
        const yuzdeliKesirStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (yuzdeliKesirStats.questionHistory) {
            Object.keys(yuzdeliKesirStats.questionHistory).forEach(question => {
                if (yuzdeliKesirStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor yüzdeli kesir sorularını getir (karmaşık yüzdeler)
    getZorYuzdeliKesirSorulari() {
        const zorSorular = ['12', '15', '37']; // 1/8, 1/20, 3/8 gibi zor yüzdeler
        return zorSorular;
    }

    // Kesirli ondalık alıştırmasını başlat
    startKesirliOndalik() {
        try {
            console.log('Kesirli ondalık alıştırması başlatılıyor...');
            this.currentSubModule = 'kesirliOndalik';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
                <h2>Kesirli İfadelerin Ondalıklı Sayı Karşılığı</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">Kesirli ifadelerin ondalıklı sayı olarak kaça denk geldiğini hesaplayın</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateKesirliOndalikQuestion();
        } catch (error) {
            console.error('startKesirliOndalik hatası:', error);
        }
    }

    // Kesirli ondalık sorusu üret
    generateKesirliOndalikQuestion() {
        try {
            console.log('generateKesirliOndalikQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastKesirliOndalikSorusu) {
                this.lastKesirliOndalikSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateKesirliOndalikKombinasyonlari().filter(soru => soru !== this.lastKesirliOndalikSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastKesirliOndalikSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateKesirliOndalikKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastKesirliOndalikSorusu = selectedQuestion;
                const answer = this.getKesirliOndalikCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer !== null) {
                    this.showKesirliOndalikQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastKesirliOndalikSorusu = selectedQuestion;
            const answer = this.getKesirliOndalikCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer !== null) {
                this.showKesirliOndalikQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showKesirliOndalikQuestion('1/2', 0.5);
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showKesirliOndalikQuestion('1/2', 0.5);
        }
    }

    // Kesirli ondalık sorusunu göster
    showKesirliOndalikQuestion(question, answer) {
        try {
            console.log('showKesirliOndalikQuestion başladı:', question, answer);
            const exerciseContainer = document.getElementById('exercise-container');
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">${this.formatKesir(question)} kesri ondalıklı sayı olarak kaça denk gelir?</div>
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin-bottom: 10px;">Cevabınızı ondalıklı sayı olarak girin:</p>
                        <p style="color: #666; font-size: 0.9rem;">Örnek: 0.5, 0.75, 0.6, 0.66 (tekrarlayan sayılar için)</p>
                    </div>
                    <input type="number" id="answer-input" class="answer-input" placeholder="Ondalıklı sayıyı girin (örn: 0.5, 0.66)" step="0.01" min="0" max="1" autocomplete="off">
                    <br>
                    <button class="check-button" onclick="moduleSystem.checkKesirliOndalikAnswer(${answer})">Kontrol Et</button>
                    <div id="result"></div>
                </div>
            `;

            console.log('HTML yüklendi, input focus yapılıyor...');
            // Enter tuşu ile cevap verme
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkKesirliOndalikAnswer(answer);
                }
            });
            console.log('showKesirliOndalikQuestion tamamlandı');
        } catch (error) {
            console.error('showKesirliOndalikQuestion hatası:', error);
        }
    }

    // Kesirli ondalık cevabını kontrol et
    checkKesirliOndalikAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = parseFloat(input.value);
            const resultDiv = document.getElementById('result');
            
            if (isNaN(userAnswer)) {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
                return;
            }

            if (correctAnswer === null) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            // Tekrarlayan ondalık sayılar için daha esnek tolerans
            let isCorrect = false;
            
            // Önce tam eşitlik kontrolü
            if (Math.abs(userAnswer - correctAnswer) < 0.0001) {
                isCorrect = true;
            } else {
                // Kullanıcı cevabını 2 ondalık basamağa yuvarla
                const roundedUserAnswer = Math.round(userAnswer * 100) / 100;
                const roundedCorrectAnswer = Math.round(correctAnswer * 100) / 100;
                
                // 0.01 tolerans ile kontrol
                if (Math.abs(roundedUserAnswer - roundedCorrectAnswer) < 0.01) {
                    isCorrect = true;
                } else {
                    // Tekrarlayan ondalık sayılar için özel kontrol
                    // Örnek: 0.6666666666666666 için 0.66, 0.67, 0.666 kabul et
                    const userAnswerStr = userAnswer.toString();
                    const correctAnswerStr = correctAnswer.toString();
                    
                    // Kullanıcı cevabı 2-3 basamak ise ve doğru cevabın ilk basamaklarıyla eşleşiyorsa kabul et
                    if (userAnswerStr.length <= 5 && correctAnswerStr.length > 5) {
                        const userRounded = Math.round(userAnswer * 1000) / 1000; // 3 basamak
                        const correctRounded = Math.round(correctAnswer * 1000) / 1000;
                        
                        if (Math.abs(userRounded - correctRounded) < 0.001) {
                            isCorrect = true;
                        }
                    }
                }
            }
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                this.generateKesirliOndalikQuestion();
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: ${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Kesirli ondalık sorusunun cevabını getir
    getKesirliOndalikCevabi(question) {
        try {
            const parts = question.split('/');
            if (parts.length !== 2) {
                console.error('Geçersiz kesir formatı:', question);
                return null;
            }
            
            const pay = parseInt(parts[0]);
            const payda = parseInt(parts[1]);
            
            if (isNaN(pay) || isNaN(payda) || payda === 0) {
                console.error('Geçersiz pay veya payda:', question);
                return null;
            }
            
            const ondalik = pay / payda;
            return ondalik;
        } catch (error) {
            console.error('Ondalık hesaplama hatası:', error, question);
            return null;
        }
    }

    // Kesirli ondalık için tüm kombinasyonları oluştur
    generateKesirliOndalikKombinasyonlari() {
        const kombinasyonlar = [
            '1/2', '1/3', '1/4', '1/5', '1/8', '1/10', '1/20',
            '2/3', '2/5', '3/4', '3/5', '3/8', '4/5'
        ];
        return kombinasyonlar;
    }

    // Hata yapılan kesirli ondalık sorularını getir
    getHataliKesirliOndalikSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kesirliOndalik';
        const kesirliOndalikStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kesirliOndalikStats.questionHistory) {
            Object.keys(kesirliOndalikStats.questionHistory).forEach(question => {
                if (kesirliOndalikStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kesirli ondalık sorularını getir (karmaşık kesirler)
    getZorKesirliOndalikSorulari() {
        const zorSorular = ['1/3', '1/6', '2/3']; // Bu kesirler genellikle daha zordur
        return zorSorular;
    }

    // Yüzdeli ondalık alıştırmasını başlat
    startYuzdeliOndalik() {
        try {
            console.log('Yüzdeli ondalık alıştırması başlatılıyor...');
            this.currentSubModule = 'yuzdeliOndalik';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
                <h2>Yüzdeli İfadelerin Ondalıklı Sayı Karşılığı</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">Yüzde değerlerinin ondalıklı sayı olarak kaça denk geldiğini bulun</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateYuzdeliOndalikQuestion();
        } catch (error) {
            console.error('startYuzdeliOndalik hatası:', error);
        }
    }

    // Yüzdeli ondalık sorusu üret
    generateYuzdeliOndalikQuestion() {
        try {
            console.log('generateYuzdeliOndalikQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastYuzdeliOndalikSorusu) {
                this.lastYuzdeliOndalikSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateYuzdeliOndalikKombinasyonlari().filter(soru => soru !== this.lastYuzdeliOndalikSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastYuzdeliOndalikSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateYuzdeliOndalikKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastYuzdeliOndalikSorusu = selectedQuestion;
                const answer = this.getYuzdeliOndalikCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer !== null) {
                    this.showYuzdeliOndalikQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastYuzdeliOndalikSorusu = selectedQuestion;
            const answer = this.getYuzdeliOndalikCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer !== null) {
                this.showYuzdeliOndalikQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showYuzdeliOndalikQuestion('50', 0.5);
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showYuzdeliOndalikQuestion('50', 0.5);
        }
    }

    // Yüzdeli ondalık sorusunu göster
    showYuzdeliOndalikQuestion(question, answer) {
        try {
            console.log('showYuzdeliOndalikQuestion başladı:', question, answer);
            const exerciseContainer = document.getElementById('exercise-container');
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">%${question} yüzdesi ondalıklı sayı olarak kaça denk gelir?</div>
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin-bottom: 10px;">Cevabınızı ondalıklı sayı olarak girin:</p>
                        <p style="color: #666; font-size: 0.9rem;">Örnek: 0.5, 0.75, 0.6, 0.66 (tekrarlayan sayılar için)</p>
                    </div>
                    <input type="number" id="answer-input" class="answer-input" placeholder="Ondalıklı sayıyı girin (örn: 0.5, 0.66)" step="0.01" min="0" max="1" autocomplete="off">
                    <br>
                    <button class="check-button" onclick="moduleSystem.checkYuzdeliOndalikAnswer(${answer})">Kontrol Et</button>
                    <div id="result"></div>
                </div>
            `;

            console.log('HTML yüklendi, input focus yapılıyor...');
            // Enter tuşu ile cevap verme
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkYuzdeliOndalikAnswer(answer);
                }
            });
            console.log('showYuzdeliOndalikQuestion tamamlandı');
        } catch (error) {
            console.error('showYuzdeliOndalikQuestion hatası:', error);
        }
    }

    // Yüzdeli ondalık cevabını kontrol et
    checkYuzdeliOndalikAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = parseFloat(input.value);
            const resultDiv = document.getElementById('result');
            
            if (isNaN(userAnswer)) {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
                return;
            }

            if (correctAnswer === null) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            // Tekrarlayan ondalık sayılar için daha esnek tolerans
            let isCorrect = false;
            
            // Önce tam eşitlik kontrolü
            if (Math.abs(userAnswer - correctAnswer) < 0.0001) {
                isCorrect = true;
            } else {
                // Kullanıcı cevabını 2 ondalık basamağa yuvarla
                const roundedUserAnswer = Math.round(userAnswer * 100) / 100;
                const roundedCorrectAnswer = Math.round(correctAnswer * 100) / 100;
                
                // 0.01 tolerans ile kontrol
                if (Math.abs(roundedUserAnswer - roundedCorrectAnswer) < 0.01) {
                    isCorrect = true;
                } else {
                    // Tekrarlayan ondalık sayılar için özel kontrol
                    // Örnek: 0.6666666666666666 için 0.66, 0.67, 0.666 kabul et
                    const userAnswerStr = userAnswer.toString();
                    const correctAnswerStr = correctAnswer.toString();
                    
                    // Kullanıcı cevabı 2-3 basamak ise ve doğru cevabın ilk basamaklarıyla eşleşiyorsa kabul et
                    if (userAnswerStr.length <= 5 && correctAnswerStr.length > 5) {
                        const userRounded = Math.round(userAnswer * 1000) / 1000; // 3 basamak
                        const correctRounded = Math.round(correctAnswer * 1000) / 1000;
                        
                        if (Math.abs(userRounded - correctRounded) < 0.001) {
                            isCorrect = true;
                        }
                    }
                }
            }
            
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                this.generateYuzdeliOndalikQuestion();
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: ${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Yüzdeli ondalık sorusunun cevabını getir
    getYuzdeliOndalikCevabi(question) {
        try {
            // Yüzde değerini sayıya çevir
            const yuzde = parseInt(question);
            if (isNaN(yuzde)) {
                console.error('Geçersiz yüzde değeri:', question);
                return null;
            }
            
            // Yüzdeyi ondalık sayıya çevir (100'e böl)
            const ondalik = yuzde / 100;
            return ondalik;
        } catch (error) {
            console.error('Ondalık hesaplama hatası:', error, question);
            return null;
        }
    }

    // Yüzdeli ondalık için tüm kombinasyonları oluştur
    generateYuzdeliOndalikKombinasyonlari() {
        const kombinasyonlar = [
            '50', '33', '25', '20', '12', '10', '5',
            '67', '40', '75', '60', '37', '80'
        ];
        return kombinasyonlar;
    }

    // Hata yapılan yüzdeli ondalık sorularını getir
    getHataliYuzdeliOndalikSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'yuzdeliOndalik';
        const yuzdeliOndalikStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (yuzdeliOndalikStats.questionHistory) {
            Object.keys(yuzdeliOndalikStats.questionHistory).forEach(question => {
                if (yuzdeliOndalikStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor yüzdeli ondalık sorularını getir (karmaşık yüzdeler)
    getZorYuzdeliOndalikSorulari() {
        const zorSorular = ['33', '67', '37']; // 1/3, 2/3, 3/8 gibi zor yüzdeler
        return zorSorular;
    }

    // Kesir sadeleştirme alıştırmasını başlat
    startKesirSadelestirme() {
        try {
            console.log('Kesir sadeleştirme alıştırması başlatılıyor...');
            this.currentSubModule = 'kesirSadelestirme';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
                <h2>Kesir Sadeleştirme</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">Verilen kesiri en sade haline getirin</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateKesirSadelestirmeQuestion();
        } catch (error) {
            console.error('startKesirSadelestirme hatası:', error);
        }
    }

    // Kesir sadeleştirme sorusu üret
    generateKesirSadelestirmeQuestion() {
        try {
            console.log('generateKesirSadelestirmeQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastKesirSadelestirmeSorusu) {
                this.lastKesirSadelestirmeSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateKesirSadelestirmeKombinasyonlari().filter(soru => soru !== this.lastKesirSadelestirmeSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastKesirSadelestirmeSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateKesirSadelestirmeKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastKesirSadelestirmeSorusu = selectedQuestion;
                const answer = this.getKesirSadelestirmeCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer !== null) {
                    this.showKesirSadelestirmeQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastKesirSadelestirmeSorusu = selectedQuestion;
            const answer = this.getKesirSadelestirmeCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer !== null) {
                this.showKesirSadelestirmeQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showKesirSadelestirmeQuestion('4/8', '1/2');
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showKesirSadelestirmeQuestion('4/8', '1/2');
        }
    }

    // Kesir sadeleştirme sorusunu göster
    showKesirSadelestirmeQuestion(question, answer) {
        try {
            console.log('showKesirSadelestirmeQuestion başladı:', question, answer);
            const exerciseContainer = document.getElementById('exercise-container');
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">${this.formatKesir(question)} kesirini en sade haline getirin</div>
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin-bottom: 10px;">Cevabınızı "pay/payda" formatında girin:</p>
                        <p style="color: #666; font-size: 0.9rem;">Örnek: 1/2, 3/4, 2/3, 3 (tam sayılar için)</p>
                    </div>
                    <input type="text" id="answer-input" class="answer-input" placeholder="Kesir formatında girin (örn: 1/2)" autocomplete="off">
                    <br>
                    <button class="check-button" onclick="moduleSystem.checkKesirSadelestirmeAnswer('${answer}')">Kontrol Et</button>
                    <div id="result"></div>
                </div>
            `;

            console.log('HTML yüklendi, input focus yapılıyor...');
            // Enter tuşu ile cevap verme
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkKesirSadelestirmeAnswer(answer);
                }
            });
            console.log('showKesirSadelestirmeQuestion tamamlandı');
        } catch (error) {
            console.error('showKesirSadelestirmeQuestion hatası:', error);
        }
    }

    // Kesir sadeleştirme cevabını kontrol et
    checkKesirSadelestirmeAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = input.value.trim();
            const resultDiv = document.getElementById('result');
            
            if (!userAnswer || userAnswer === '') {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen bir cevap girin!</div>';
                return;
            }

            if (correctAnswer === null) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            // Kullanıcı cevabını normalize et
            const normalizedUserAnswer = this.normalizeUserAnswer(userAnswer);
            const normalizedCorrectAnswer = this.normalizeKesir(correctAnswer);
            
            const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
            
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                this.generateKesirSadelestirmeQuestion();
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: ${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Kesir sadeleştirme sorusunun cevabını getir
    getKesirSadelestirmeCevabi(question) {
        try {
            // Kesir formatını kontrol et (örn: "4/8")
            const parts = question.split('/');
            if (parts.length !== 2) {
                console.error('Geçersiz kesir formatı:', question);
                return null;
            }
            
            const pay = parseInt(parts[0]);
            const payda = parseInt(parts[1]);
            
            if (isNaN(pay) || isNaN(payda) || payda === 0) {
                console.error('Geçersiz pay veya payda:', pay, payda);
                return null;
            }
            
            // En büyük ortak böleni bul (EBOB)
            const ebob = this.findGCD(pay, payda);
            
            // Sadeleştirilmiş kesir
            const sadelestirilmisPay = pay / ebob;
            const sadelestirilmisPayda = payda / ebob;
            
            return `${sadelestirilmisPay}/${sadelestirilmisPayda}`;
        } catch (error) {
            console.error('Kesir sadeleştirme hesaplama hatası:', error, question);
            return null;
        }
    }

    // En büyük ortak böleni bul (Euclidean algorithm)
    findGCD(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // Kesir formatını normalize et (pay ve payda pozitif, en sade hali)
    normalizeKesir(kesir) {
        try {
            const parts = kesir.split('/');
            if (parts.length !== 2) return kesir;
            
            let pay = parseInt(parts[0]);
            let payda = parseInt(parts[1]);
            
            if (isNaN(pay) || isNaN(payda) || payda === 0) return kesir;
            
            // Negatif işaretleri normalize et
            if (pay < 0 && payda < 0) {
                pay = Math.abs(pay);
                payda = Math.abs(payda);
            } else if (payda < 0) {
                pay = -pay;
                payda = Math.abs(payda);
            }
            
            // En büyük ortak böleni bul
            const ebob = this.findGCD(Math.abs(pay), payda);
            
            // Sadeleştirilmiş kesir
            const sadelestirilmisPay = pay / ebob;
            const sadelestirilmisPayda = payda / ebob;
            
            return `${sadelestirilmisPay}/${sadelestirilmisPayda}`;
        } catch (error) {
            console.error('Kesir normalizasyon hatası:', error, kesir);
            return kesir;
        }
    }

    // Kullanıcı cevabını normalize et (tam sayı kesirler için esneklik)
    normalizeUserAnswer(userAnswer) {
        try {
            // Önce boşlukları temizle
            const cleanedAnswer = userAnswer.trim();
            
            // Eğer sadece sayı ise (örn: "3"), bunu "3/1" formatına çevir
            if (!cleanedAnswer.includes('/')) {
                const number = parseInt(cleanedAnswer);
                if (!isNaN(number)) {
                    return `${number}/1`;
                }
            }
            
            // Normal kesir formatı ise normalize et
            return this.normalizeKesir(cleanedAnswer);
        } catch (error) {
            console.error('Kullanıcı cevabı normalizasyon hatası:', error, userAnswer);
            return userAnswer;
        }
    }

    // Kesir sadeleştirme için tüm kombinasyonları oluştur
    generateKesirSadelestirmeKombinasyonlari() {
        const kombinasyonlar = [
            // Bir / Bir basamaklı
            '2/4', '3/6', '4/8', '6/8', '8/10',
            // İki / Bir basamaklı
            '10/5', '12/6', '15/5', '18/6', '20/5', '24/8', '28/7', '30/6', '32/8', '36/9',
            // Bir / İki basamaklı
            '3/12', '4/16', '5/15', '6/18', '7/14', '8/20', '9/18', '2/10', '3/15', '4/20',
            // İki / İki basamaklı
            '12/16', '15/20', '18/24', '20/25', '24/32', '28/35', '30/36', '32/40', '36/45', '40/50'
        ];
        return kombinasyonlar;
    }

    // Hata yapılan kesir sadeleştirme sorularını getir
    getHataliKesirSadelestirmeSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kesirSadelestirme';
        const kesirSadelestirmeStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kesirSadelestirmeStats.questionHistory) {
            Object.keys(kesirSadelestirmeStats.questionHistory).forEach(question => {
                if (kesirSadelestirmeStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kesir sadeleştirme sorularını getir (karmaşık kesirler)
    getZorKesirSadelestirmeSorulari() {
        const zorSorular = ['24/32', '28/35', '30/36', '32/40', '36/45', '40/50']; // İki basamaklı kesirler
        return zorSorular;
    }

    // Kesirli işlemler alıştırmasını başlat
    startKesirliIslemler() {
        try {
            console.log('Kesirli işlemler alıştırması başlatılıyor...');
            this.currentSubModule = 'kesirliIslemler';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
                <h2>Tam Sayı + Rasyonel Sayı İşlemleri</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">Önce zorluk seviyesini seçin, sonra işlemleri yapın</p>
                <div id="exercise-container">
                    <div class="sub-module" onclick="moduleSystem.startKesirliIslemlerBirBasamakli()">
                        <h4>Bir Basamaklı Sayılar</h4>
                        <p>2, 3, 4, 5, 6 gibi bir basamaklı sayılarla işlem yapın</p>
                    </div>
                    <div class="sub-module" onclick="moduleSystem.startKesirliIslemlerIkiBasamakli()">
                        <h4>İki Basamaklı Sayılar</h4>
                        <p>10, 12, 15, 18 gibi iki basamaklı sayılarla işlem yapın</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('startKesirliIslemler hatası:', error);
        }
    }

    // Bir basamaklı sayılarla kesirli işlemler alıştırmasını başlat
    startKesirliIslemlerBirBasamakli() {
        try {
            console.log('Bir basamaklı kesirli işlemler alıştırması başlatılıyor...');
            this.currentSubModule = 'kesirliIslemlerBirBasamakli';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.startKesirliIslemler()">← Zorluk Seviyesi Seçimine Dön</button>
                <h2>Bir Basamaklı Sayı + Rasyonel Sayı İşlemleri</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">2, 3, 4, 5, 6 gibi bir basamaklı sayılarla işlem yapın</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateKesirliIslemlerBirBasamakliQuestion();
        } catch (error) {
            console.error('startKesirliIslemlerBirBasamakli hatası:', error);
        }
    }

    // İki basamaklı sayılarla kesirli işlemler alıştırmasını başlat
    startKesirliIslemlerIkiBasamakli() {
        try {
            console.log('İki basamaklı kesirli işlemler alıştırması başlatılıyor...');
            this.currentSubModule = 'kesirliIslemlerIkiBasamakli';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.startKesirliIslemler()">← Zorluk Seviyesi Seçimine Dön</button>
                <h2>İki Basamaklı Sayı + Rasyonel Sayı İşlemleri</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">10, 12, 15, 18 gibi iki basamaklı sayılarla işlem yapın</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateKesirliIslemlerIkiBasamakliQuestion();
        } catch (error) {
            console.error('startKesirliIslemlerIkiBasamakli hatası:', error);
        }
    }

    // Bir basamaklı kesirli işlemler sorusu üret
    generateKesirliIslemlerBirBasamakliQuestion() {
        try {
            console.log('generateKesirliIslemlerBirBasamakliQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastKesirliIslemlerBirBasamakliSorusu) {
                this.lastKesirliIslemlerBirBasamakliSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateKesirliIslemlerBirBasamakliKombinasyonlari().filter(soru => soru !== this.lastKesirliIslemlerBirBasamakliSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastKesirliIslemlerBirBasamakliSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateKesirliIslemlerBirBasamakliKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastKesirliIslemlerBirBasamakliSorusu = selectedQuestion;
                const answer = this.getKesirliIslemlerCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer !== null) {
                    this.showKesirliIslemlerQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastKesirliIslemlerBirBasamakliSorusu = selectedQuestion;
            const answer = this.getKesirliIslemlerCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer !== null) {
                this.showKesirliIslemlerQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showKesirliIslemlerQuestion('2 - 3/4', '5/4');
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showKesirliIslemlerQuestion('2 - 3/4', '5/4');
        }
    }

    // İki basamaklı kesirli işlemler sorusu üret
    generateKesirliIslemlerIkiBasamakliQuestion() {
        try {
            console.log('generateKesirliIslemlerIkiBasamakliQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastKesirliIslemlerIkiBasamakliSorusu) {
                this.lastKesirliIslemlerIkiBasamakliSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateKesirliIslemlerIkiBasamakliKombinasyonlari().filter(soru => soru !== this.lastKesirliIslemlerIkiBasamakliSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastKesirliIslemlerIkiBasamakliSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateKesirliIslemlerIkiBasamakliKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastKesirliIslemlerIkiBasamakliSorusu = selectedQuestion;
                const answer = this.getKesirliIslemlerCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer !== null) {
                    this.showKesirliIslemlerQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastKesirliIslemlerIkiBasamakliSorusu = selectedQuestion;
            const answer = this.getKesirliIslemlerCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer !== null) {
                this.showKesirliIslemlerQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showKesirliIslemlerQuestion('10 + 1/2', '21/2');
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showKesirliIslemlerQuestion('10 + 1/2', '21/2');
        }
    }

    // Kesirli işlemler sorusunu göster
    showKesirliIslemlerQuestion(question, answer) {
        try {
            console.log('showKesirliIslemlerQuestion başladı:', question, answer);
            const exerciseContainer = document.getElementById('exercise-container');
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">${this.formatKesirliIslem(question)} işlemini yapın</div>
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin-bottom: 10px;">Sonucu rasyonel sayı olarak girin:</p>
                        <p style="color: #666; font-size: 0.9rem;">Örnek: 5/4, 7/3, 1/2</p>
                    </div>
                    <input type="text" id="answer-input" class="answer-input" placeholder="Kesir formatında girin (örn: 5/4)" autocomplete="off">
                    <br>
                    <button class="check-button" onclick="moduleSystem.checkKesirliIslemlerAnswer('${answer}')">Kontrol Et</button>
                    <div id="result"></div>
                </div>
            `;

            console.log('HTML yüklendi, input focus yapılıyor...');
            // Enter tuşu ile cevap verme
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkKesirliIslemlerAnswer(answer);
                }
            });
            console.log('showKesirliIslemlerQuestion tamamlandı');
        } catch (error) {
            console.error('showKesirliIslemlerQuestion hatası:', error);
        }
    }

    // Kesirli işlemler cevabını kontrol et
    checkKesirliIslemlerAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = input.value.trim();
            const resultDiv = document.getElementById('result');
            
            if (!userAnswer || userAnswer === '') {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen bir cevap girin!</div>';
                return;
            }

            if (correctAnswer === null) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            // Kullanıcı cevabını normalize et
            const normalizedUserAnswer = this.normalizeKesir(userAnswer);
            const normalizedCorrectAnswer = this.normalizeKesir(correctAnswer);
            
            const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
            
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                if (this.currentSubModule === 'kesirliIslemlerBirBasamakli') {
                    this.generateKesirliIslemlerBirBasamakliQuestion();
                } else if (this.currentSubModule === 'kesirliIslemlerIkiBasamakli') {
                    this.generateKesirliIslemlerIkiBasamakliQuestion();
                }
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: ${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Kesirli işlemler sorusunun cevabını getir
    getKesirliIslemlerCevabi(question) {
        try {
            // Soru formatını parse et (örn: "2 - 3/4" veya "5 + 1/2")
            const parts = question.split(' ');
            if (parts.length !== 3) {
                console.error('Geçersiz soru formatı:', question);
                return null;
            }
            
            const tamSayi = parseInt(parts[0]);
            const operator = parts[1]; // + veya -
            const kesir = parts[2]; // "3/4" formatında
            
            if (isNaN(tamSayi)) {
                console.error('Geçersiz tam sayı:', parts[0]);
                return null;
            }
            
            // Kesri parse et
            const kesirParts = kesir.split('/');
            if (kesirParts.length !== 2) {
                console.error('Geçersiz kesir formatı:', kesir);
                return null;
            }
            
            const pay = parseInt(kesirParts[0]);
            const payda = parseInt(kesirParts[1]);
            
            if (isNaN(pay) || isNaN(payda) || payda === 0) {
                console.error('Geçersiz pay veya payda:', pay, payda);
                return null;
            }
            
            // Tam sayıyı kesir formatına çevir
            const tamSayiKesir = `${tamSayi * payda}/${payda}`;
            
            let sonuc;
            if (operator === '+') {
                // Toplama: (tamSayi * payda + pay) / payda
                const yeniPay = tamSayi * payda + pay;
                sonuc = `${yeniPay}/${payda}`;
            } else if (operator === '-') {
                // Çıkarma: (tamSayi * payda - pay) / payda
                const yeniPay = tamSayi * payda - pay;
                sonuc = `${yeniPay}/${payda}`;
            } else {
                console.error('Geçersiz operatör:', operator);
                return null;
            }
            
            // Sonucu sadeleştir
            return this.normalizeKesir(sonuc);
        } catch (error) {
            console.error('Kesirli işlem hesaplama hatası:', error, question);
            return null;
        }
    }

    // Kesirli işlem formatını göster
    formatKesirliIslem(question) {
        try {
            const parts = question.split(' ');
            if (parts.length !== 3) return question;
            
            const tamSayi = parts[0];
            const operator = parts[1];
            const kesir = parts[2];
            
            // Kesri formatla
            const formattedKesir = this.formatKesir(kesir);
            
            return `${tamSayi} ${operator} ${formattedKesir}`;
        } catch (error) {
            console.error('Kesirli işlem format hatası:', error, question);
            return question;
        }
    }

    // Bir basamaklı sayılarla kesirli işlemler için tüm kombinasyonları oluştur
    generateKesirliIslemlerBirBasamakliKombinasyonlari() {
        const kombinasyonlar = [
            // Toplama işlemleri
            '2 + 1/2', '3 + 1/3', '4 + 1/4', '5 + 1/5', '6 + 1/6',
            '2 + 2/3', '3 + 2/3', '4 + 2/3', '5 + 2/3', '6 + 2/3',
            '2 + 3/4', '3 + 3/4', '4 + 3/4', '5 + 3/4', '6 + 3/4',
            '2 + 4/5', '3 + 4/5', '4 + 4/5', '5 + 4/5', '6 + 4/5',
            // Çıkarma işlemleri
            '2 - 1/2', '3 - 1/3', '4 - 1/4', '5 - 1/5', '6 - 1/6',
            '2 - 2/3', '3 - 2/3', '4 - 2/3', '5 - 2/3', '6 - 2/3',
            '2 - 3/4', '3 - 3/4', '4 - 3/4', '5 - 3/4', '6 - 3/4',
            '2 - 4/5', '3 - 4/5', '4 - 4/5', '5 - 4/5', '6 - 4/5'
        ];
        return kombinasyonlar;
    }

    // İki basamaklı sayılarla kesirli işlemler için tüm kombinasyonları oluştur
    generateKesirliIslemlerIkiBasamakliKombinasyonlari() {
        const kombinasyonlar = [
            // Toplama işlemleri
            '10 + 1/2', '12 + 1/3', '15 + 1/4', '18 + 1/5', '20 + 1/6',
            '10 + 2/3', '12 + 2/3', '15 + 2/3', '18 + 2/3', '20 + 2/3',
            '10 + 3/4', '12 + 3/4', '15 + 3/4', '18 + 3/4', '20 + 3/4',
            '10 + 4/5', '12 + 4/5', '15 + 4/5', '18 + 4/5', '20 + 4/5',
            // Çıkarma işlemleri
            '10 - 1/2', '12 - 1/3', '15 - 1/4', '18 - 1/5', '20 - 1/6',
            '10 - 2/3', '12 - 2/3', '15 - 2/3', '18 - 2/3', '20 - 2/3',
            '10 - 3/4', '12 - 3/4', '15 - 3/4', '18 - 3/4', '20 - 3/4',
            '10 - 4/5', '12 - 4/5', '15 - 4/5', '18 - 4/5', '20 - 4/5'
        ];
        return kombinasyonlar;
    }

    // Kesirli işlemler için tüm kombinasyonları oluştur (genel)
    generateKesirliIslemlerKombinasyonlari() {
        const birBasamakli = this.generateKesirliIslemlerBirBasamakliKombinasyonlari();
        const ikiBasamakli = this.generateKesirliIslemlerIkiBasamakliKombinasyonlari();
        return [...birBasamakli, ...ikiBasamakli];
    }

    // Hata yapılan kesirli işlemler sorularını getir
    getHataliKesirliIslemlerSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kesirliIslemler';
        const kesirliIslemlerStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kesirliIslemlerStats.questionHistory) {
            Object.keys(kesirliIslemlerStats.questionHistory).forEach(question => {
                if (kesirliIslemlerStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kesirli işlemler sorularını getir (karmaşık işlemler)
    getZorKesirliIslemlerSorulari() {
        const zorSorular = [
            '15 + 3/4', '18 + 4/5', '12 - 2/3', '15 - 3/4',
            '20 + 1/3', '25 + 2/5', '30 - 1/4', '35 - 2/7'
        ]; // İki basamaklı sayılar ve karmaşık kesirler
        return zorSorular;
    }

    // Kesir paydalarının ortak katı alıştırmasını başlat
    startKesirPaydaOrtakKati() {
        try {
            console.log('Kesir paydalarının ortak katı alıştırması başlatılıyor...');
            this.currentSubModule = 'kesirPaydaOrtakKati';
            
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <button class="back-button" onclick="moduleSystem.showSubModules('kesirler')">← Alt Modüllere Dön</button>
                <h2>Kesir Paydalarının Ortak Katı</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #666;">İki kesrin paydalarının birleşeceği ortak katı bulun</p>
                <div id="exercise-container">
                    <!-- Alıştırma buraya gelecek -->
                </div>
            `;

            console.log('HTML yüklendi, soru üretiliyor...');
            this.generateKesirPaydaOrtakKatiQuestion();
        } catch (error) {
            console.error('startKesirPaydaOrtakKati hatası:', error);
        }
    }

    // Kesir paydalarının ortak katı sorusu üret
    generateKesirPaydaOrtakKatiQuestion() {
        try {
            console.log('generateKesirPaydaOrtakKatiQuestion başladı');
            const exerciseContainer = document.getElementById('exercise-container');
            
            // Son sorulan soruyu hatırla
            if (!this.lastKesirPaydaOrtakKatiSorusu) {
                this.lastKesirPaydaOrtakKatiSorusu = '';
            }

            console.log('Mevcut sorular kontrol ediliyor...');
            // Normal rastgele soru (son sorulan hariç)
            const availableQuestions = this.generateKesirPaydaOrtakKatiKombinasyonlari().filter(soru => soru !== this.lastKesirPaydaOrtakKatiSorusu);
            console.log('Kullanılabilir sorular:', availableQuestions);
            
            if (availableQuestions.length === 0) {
                console.log('Hiç soru kalmadı, yeni kombinasyonlar oluşturuluyor...');
                this.lastKesirPaydaOrtakKatiSorusu = '';
                const shuffledKombinasyonlar = this.shuffleArray([...this.generateKesirPaydaOrtakKatiKombinasyonlari()]);
                const selectedQuestion = shuffledKombinasyonlar[0];
                this.lastKesirPaydaOrtakKatiSorusu = selectedQuestion;
                const answer = this.getKesirPaydaOrtakKatiCevabi(selectedQuestion);
                console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
                if (answer !== null) {
                    this.showKesirPaydaOrtakKatiQuestion(selectedQuestion, answer);
                    return;
                }
            }
            
            const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.lastKesirPaydaOrtakKatiSorusu = selectedQuestion;
            const answer = this.getKesirPaydaOrtakKatiCevabi(selectedQuestion);
            console.log('Seçilen soru:', selectedQuestion, 'Cevap:', answer);
            
            if (answer !== null) {
                this.showKesirPaydaOrtakKatiQuestion(selectedQuestion, answer);
            } else {
                console.error('Geçersiz cevap üretildi:', selectedQuestion, answer);
                // Hata durumunda basit bir soru göster
                this.showKesirPaydaOrtakKatiQuestion('3/4 + 1/2', 4);
            }
        } catch (error) {
            console.error('Soru üretme hatası:', error);
            // Hata durumunda basit bir soru göster
            this.showKesirPaydaOrtakKatiQuestion('3/4 + 1/2', 4);
        }
    }

    // Kesir paydalarının ortak katı sorusunu göster
    showKesirPaydaOrtakKatiQuestion(question, answer) {
        try {
            console.log('showKesirPaydaOrtakKatiQuestion başladı:', question, answer);
            const exerciseContainer = document.getElementById('exercise-container');
            
            exerciseContainer.innerHTML = `
                <div class="question-container">
                    <div class="question">${this.formatKesirPaydaOrtakKati(question)} işleminde paydalar hangi sayıda birleşir?</div>
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin-bottom: 10px;">Paydaların en küçük ortak katını (EKOK) bulun:</p>
                        <p style="color: #666; font-size: 0.9rem;">Örnek: 3/4 + 1/2 için paydalar 4 ve 2, EKOK = 4</p>
                    </div>
                    <input type="number" id="answer-input" class="answer-input" placeholder="Ortak katı girin (örn: 4)" min="1" autocomplete="off">
                    <br>
                    <button class="check-button" onclick="moduleSystem.checkKesirPaydaOrtakKatiAnswer(${answer})">Kontrol Et</button>
                    <div id="result"></div>
                </div>
            `;

            console.log('HTML yüklendi, input focus yapılıyor...');
            // Enter tuşu ile cevap verme
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkKesirPaydaOrtakKatiAnswer(answer);
                }
            });
            console.log('showKesirPaydaOrtakKatiQuestion tamamlandı');
        } catch (error) {
            console.error('showKesirPaydaOrtakKatiQuestion hatası:', error);
        }
    }

    // Kesir paydalarının ortak katı cevabını kontrol et
    checkKesirPaydaOrtakKatiAnswer(correctAnswer) {
        try {
            const input = document.getElementById('answer-input');
            const userAnswer = parseInt(input.value);
            const resultDiv = document.getElementById('result');
            
            if (isNaN(userAnswer)) {
                resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
                return;
            }

            if (correctAnswer === null) {
                console.error('Geçersiz doğru cevap:', correctAnswer);
                resultDiv.innerHTML = '<div class="result incorrect">Soru hatası! Lütfen sayfayı yenileyin.</div>';
                return;
            }

            const isCorrect = userAnswer === correctAnswer;
            
            const questionText = document.querySelector('.question').textContent;
            
            // İstatistikleri güncelle
            this.updateStats(questionText, isCorrect);
            
            if (isCorrect) {
                resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
                input.value = '';
                
                // Direkt yeni soru üret (bekleme yok)
                this.generateKesirPaydaOrtakKatiQuestion();
            } else {
                resultDiv.innerHTML = `
                    <div class="result incorrect">
                        Yanlış cevap! Doğru cevap: ${correctAnswer}
                        <br>
                        <small>Tekrar deneyin!</small>
                    </div>
                `;
                input.value = '';
                input.focus();
            }
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result incorrect">Bir hata oluştu! Lütfen sayfayı yenileyin.</div>';
        }
    }

    // Kesir paydalarının ortak katı sorusunun cevabını getir
    getKesirPaydaOrtakKatiCevabi(question) {
        try {
            // Soru formatını parse et (örn: "3/4 + 1/2" veya "2/3 - 1/6")
            const parts = question.split(' ');
            if (parts.length !== 3) {
                console.error('Geçersiz soru formatı:', question);
                return null;
            }
            
            const kesir1 = parts[0]; // "3/4" formatında
            const operator = parts[1]; // + veya -
            const kesir2 = parts[2]; // "1/2" formatında
            
            // İlk kesrin paydasını al
            const kesir1Parts = kesir1.split('/');
            if (kesir1Parts.length !== 2) {
                console.error('Geçersiz ilk kesir formatı:', kesir1);
                return null;
            }
            
            const payda1 = parseInt(kesir1Parts[1]);
            
            if (isNaN(payda1) || payda1 === 0) {
                console.error('Geçersiz ilk kesir payda:', payda1);
                return null;
            }
            
            // İkinci kesrin paydasını al
            const kesir2Parts = kesir2.split('/');
            if (kesir2Parts.length !== 2) {
                console.error('Geçersiz ikinci kesir formatı:', kesir2);
                return null;
            }
            
            const payda2 = parseInt(kesir2Parts[1]);
            
            if (isNaN(payda2) || payda2 === 0) {
                console.error('Geçersiz ikinci kesir payda:', payda2);
                return null;
            }
            
            // En küçük ortak kat (EKOK) bul
            const ekok = this.findLCM(payda1, payda2);
            return ekok;
        } catch (error) {
            console.error('Kesir payda ortak katı hesaplama hatası:', error, question);
            return null;
        }
    }

    // En küçük ortak kat (EKOK) bul
    findLCM(a, b) {
        return (a * b) / this.findGCD(a, b);
    }

    // Kesir payda ortak katı formatını göster
    formatKesirPaydaOrtakKati(question) {
        try {
            const parts = question.split(' ');
            if (parts.length !== 3) return question;
            
            const kesir1 = parts[0];
            const operator = parts[1];
            const kesir2 = parts[2];
            
            // Kesirleri formatla
            const formattedKesir1 = this.formatKesir(kesir1);
            const formattedKesir2 = this.formatKesir(kesir2);
            
            return `${formattedKesir1} ${operator} ${formattedKesir2}`;
        } catch (error) {
            console.error('Kesir payda ortak katı format hatası:', error, question);
            return question;
        }
    }

    // Kesir payda ortak katı için tüm kombinasyonları oluştur
    generateKesirPaydaOrtakKatiKombinasyonlari() {
        const kombinasyonlar = [
            // Basit payda kombinasyonları
            '1/2 + 1/3', '1/2 + 1/4', '1/2 + 1/6', '1/2 + 2/3', '1/2 + 3/4',
            '1/3 + 1/4', '1/3 + 1/6', '1/3 + 2/3', '1/3 + 3/4', '1/3 + 4/5',
            '1/4 + 1/6', '1/4 + 2/3', '1/4 + 3/4', '1/4 + 4/5', '1/4 + 5/6',
            '2/3 + 1/4', '2/3 + 1/6', '2/3 + 3/4', '2/3 + 4/5', '2/3 + 5/6',
            '3/4 + 1/6', '3/4 + 2/5', '3/4 + 4/5', '3/4 + 5/6', '3/4 + 7/8',
            // Çıkarma işlemleri
            '3/4 - 1/2', '2/3 - 1/3', '5/6 - 1/2', '4/5 - 1/5', '7/8 - 1/4',
            '2/3 - 1/6', '3/4 - 1/6', '4/5 - 1/5', '5/6 - 1/6', '7/8 - 1/8',
            // Karmaşık payda kombinasyonları
            '3/4 - 2/5', '4/5 - 2/5', '5/6 - 2/6', '7/8 - 2/8', '9/10 - 3/10',
            '1/8 + 1/12', '1/10 + 1/15', '1/12 + 1/18', '1/15 + 1/20'
        ];
        return kombinasyonlar;
    }

    // Hata yapılan kesir payda ortak katı sorularını getir
    getHataliKesirPaydaOrtakKatiSorulari() {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseKey = 'kesirPaydaOrtakKati';
        const kesirPaydaOrtakKatiStats = exerciseStats[exerciseKey] || {};
        const hataliSorular = [];
        
        if (kesirPaydaOrtakKatiStats.questionHistory) {
            Object.keys(kesirPaydaOrtakKatiStats.questionHistory).forEach(question => {
                if (kesirPaydaOrtakKatiStats.questionHistory[question].incorrect > 0) {
                    hataliSorular.push(question);
                }
            });
        }
        
        return hataliSorular;
    }

    // Zor kesir payda ortak katı sorularını getir (karmaşık payda kombinasyonları)
    getZorKesirPaydaOrtakKatiSorulari() {
        const zorSorular = [
            '1/8 + 1/12', '1/10 + 1/15', '1/12 + 1/18', '1/15 + 1/20',
            '3/4 - 2/5', '4/5 - 2/5', '5/6 - 2/6', '7/8 - 2/8'
        ]; // Karmaşık payda kombinasyonları
        return zorSorular;
    }

    // Üslü sayıyı gerçek matematiksel formatta göster
    formatUsluSayi(question) {
        const parts = question.split('^');
        const base = parts[0];
        const exponent = parts[1];
        
        // Üs değerini Unicode superscript karakterlere çevir
        const superscriptMap = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
            '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '10': '¹⁰'
        };
        
        let formattedExponent = '';
        for (let i = 0; i < exponent.length; i++) {
            formattedExponent += superscriptMap[exponent[i]] || exponent[i];
        }
        
        // Daha okunaklı format için HTML kullan
        return `<span style="font-size: 1.2em; font-weight: bold;">${base}</span><span style="font-size: 0.9em; vertical-align: super;">${formattedExponent}</span>`;
    }

    // Üslü sayı bulma sorusunu formatla
    formatUsluSayiBulmaQuestion(question) {
        const parts = question.split(' = ');
        if (parts.length >= 2) {
            const result = parts[1];
            return `<span style="font-size: 1.3em; font-weight: bold;">${result}</span> sayısı hangi üslü sayıya eşittir?`;
        }
        return question; // Eğer format uygun değilse orijinal soruyu döndür
    }

    // Cevabı kontrol et
    // 3 seçenek oluştur (1 doğru + 2 yanlış)
    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        
        // Yanlış seçenekler oluştur
        while (options.length < 3) {
            let wrongAnswer;
            if (correctAnswer === 0) {
                // Eğer doğru cevap 0 ise, pozitif ve negatif sayılar üret
                wrongAnswer = Math.floor(Math.random() * 20) + 1;
                if (Math.random() < 0.5) wrongAnswer = -wrongAnswer;
            } else if (correctAnswer > 0) {
                // Pozitif sayılar için: doğru cevabın %50-150'si arasında rastgele
                const range = Math.max(5, Math.abs(correctAnswer));
                const min = Math.max(1, correctAnswer - range);
                const max = correctAnswer + range;
                wrongAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
                // Doğru cevaptan farklı olmalı
                if (wrongAnswer === correctAnswer) {
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? -1 : 1);
                }
            } else {
                // Negatif sayılar için
                const range = Math.max(5, Math.abs(correctAnswer));
                const min = correctAnswer - range;
                const max = Math.min(-1, correctAnswer + range);
                wrongAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
                if (wrongAnswer === correctAnswer) {
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? -1 : 1);
                }
            }
            
            // Aynı seçeneği tekrar eklememek için kontrol et
            if (!options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        // Seçenekleri karıştır
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options;
    }

    // Butonlardan gelen cevabı kontrol et
    checkAnswerFromButton(correctAnswer, userAnswer) {
        const resultDiv = document.getElementById('result');
        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // Tüm butonları devre dışı bırak
        const buttons = document.querySelectorAll('.option-button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });
        
        // Seçilen butonu vurgula
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === userAnswer) {
                if (isCorrect) {
                    btn.style.background = 'rgba(34, 197, 94, 0.2)';
                    btn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                } else {
                    btn.style.background = 'rgba(239, 68, 68, 0.2)';
                    btn.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }
            } else if (parseInt(btn.textContent) === correctAnswer && !isCorrect) {
                // Doğru cevabı göster
                btn.style.background = 'rgba(34, 197, 94, 0.2)';
                btn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
            }
        });
        
        // İstatistikleri güncelle
        this.updateStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '';
            
            // 500ms sonra yeni soru üret (kısa bir gecikme ile)
            setTimeout(() => {
                this.generateQuestion();
            }, 500);
        } else {
            resultDiv.innerHTML = '';
            
            // 1 saniye sonra yeni soru üret
            setTimeout(() => {
                this.generateQuestion();
            }, 1000);
        }
    }

    checkAnswer(correctAnswer) {
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);
        const resultDiv = document.getElementById('result');
        
        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="result incorrect">Lütfen geçerli bir sayı girin!</div>';
            return;
        }

        const isCorrect = userAnswer === correctAnswer;
        const questionText = document.querySelector('.question').textContent;
        
        // İstatistikleri güncelle
        this.updateStats(questionText, isCorrect);
        
        if (isCorrect) {
            resultDiv.innerHTML = '<div class="result correct">Tebrikler! Doğru cevap! 🎉</div>';
            input.value = '';
            
            // Direkt yeni soru üret (bekleme yok)
            this.generateQuestion();
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect">
                    Yanlış cevap! Doğru cevap: ${correctAnswer}
                    <br>
                    <small>Tekrar deneyin!</small>
                </div>
            `;
            input.value = '';
            input.focus();
        }
    }

    // İstatistikleri güncelle
    updateStats(questionText, isCorrect) {
        this.userStats.totalQuestions++;
        
        // Modül ve alıştırma istatistiklerini güncelle
        if (this.currentModule && this.currentModule !== 'ileriMatematik') {
            if (!this.userStats.moduleStats) this.userStats.moduleStats = {};
            if (!this.userStats.moduleStats[this.currentModule]) {
                this.userStats.moduleStats[this.currentModule] = { total: 0, correct: 0 };
            }
            this.userStats.moduleStats[this.currentModule].total++;
            if (isCorrect) {
                this.userStats.moduleStats[this.currentModule].correct++;
            }
        }
        
        if (this.currentSubModule) {
            if (!this.userStats.exerciseStats) this.userStats.exerciseStats = {};
            let exerciseKey = this.currentSubModule;
            
            if (!this.userStats.exerciseStats[exerciseKey]) {
                this.userStats.exerciseStats[exerciseKey] = { total: 0, correct: 0, questionHistory: {} };
            }
            this.userStats.exerciseStats[exerciseKey].total++;
            if (isCorrect) {
                this.userStats.exerciseStats[exerciseKey].correct++;
            }
            
            // Akıllı alıştırmalar için detaylı soru geçmişi tut
            if (this.currentSubModule === 'akilliCarpimTablosu' || this.currentSubModule === 'carpanBulma' || this.currentSubModule === 'ikiBasamakliCarpma' || 
                this.currentSubModule === 'birBasamakliToplama' || this.currentSubModule === 'ikiArtıBirBasamakliToplama' || 
                this.currentSubModule === 'ucArtıBirBasamakliToplama' || this.currentSubModule === 'ikiArtıIkiBasamakliToplama' ||
                this.currentSubModule === 'birBasamakliCikarma' || this.currentSubModule === 'ikiArtıBirBasamakliCikarma' || 
                this.currentSubModule === 'ucArtıBirBasamakliCikarma' || this.currentSubModule === 'ikiArtıIkiBasamakliCikarma' ||
                this.currentSubModule === 'ikiCarpıBirArtıBir' || this.currentSubModule === 'ikiCarpıIkiBasamakli' ||
                this.currentSubModule === 'ileriCarpma' || this.currentSubModule === 'usluCevapBulma' || 
                this.currentSubModule === 'usluSayiBulma' || this.currentSubModule === 'kareCevapBulma' ||
                this.currentSubModule === 'kareSayiBulma' ||                 this.currentSubModule === 'faktoriyelCevapBulma1' ||
                this.currentSubModule === 'faktoriyelCevapBulma2' || this.currentSubModule === 'faktoriyelSayiBulma1' ||
                this.currentSubModule === 'faktoriyelSayiBulma2' ||                 this.currentSubModule === 'kesirliYuzde' ||
                this.currentSubModule === 'yuzdeliKesir' || this.currentSubModule === 'kesirliOndalik' ||
                this.currentSubModule === 'yuzdeliOndalik' || this.currentSubModule === 'kesirSadelestirme' ||
                this.currentSubModule === 'kesirliIslemler' || this.currentSubModule === 'kesirliIslemlerBirBasamakli' ||
                this.currentSubModule === 'kesirliIslemlerIkiBasamakli' || this.currentSubModule === 'kesirPaydaOrtakKati') {
                if (!this.userStats.exerciseStats[exerciseKey].questionHistory[questionText]) {
                    this.userStats.exerciseStats[exerciseKey].questionHistory[questionText] = { correct: 0, incorrect: 0 };
                }
                if (isCorrect) {
                    this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].correct++;
                } else {
                    this.userStats.exerciseStats[exerciseKey].questionHistory[questionText].incorrect++;
                }
            }
        }
        
        if (isCorrect) {
            this.userStats.correctAnswers++;
        } else {
            this.userStats.incorrectAnswers++;
            
            // Yanlış yapılan soruları kaydet
            if (!this.userStats.questionHistory[questionText]) {
                this.userStats.questionHistory[questionText] = 0;
            }
            this.userStats.questionHistory[questionText]++;
            
            // Sık yanlış yapılan soruları zor sorular listesine ekle
            if (this.userStats.questionHistory[questionText] >= 2) {
                if (!this.userStats.difficultQuestions.includes(questionText)) {
                    this.userStats.difficultQuestions.push(questionText);
                }
            }
        }
        
        this.saveUserStats();
    }

    // Modül doğruluk yüzdesini hesapla (gelişmiş)
    getModuleAccuracyAdvanced(moduleType) {
        const exerciseStats = this.userStats.exerciseStats || {};
        let totalQuestions = 0;
        let totalCorrect = 0;
        
        if (moduleType === 'toplama') {
            // Toplama modülündeki tüm alıştırmaları topla
            const exercises = ['birBasamakliToplama', 'ikiArtıBirBasamakliToplama', 'ucArtıBirBasamakliToplama', 'ikiArtıIkiBasamakliToplama'];
            exercises.forEach(exercise => {
                const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
        } else if (moduleType === 'cikarma') {
            // Çıkarma modülündeki tüm alıştırmaları topla
            const exercises = ['birBasamakliCikarma', 'ikiArtıBirBasamakliCikarma', 'ucArtıBirBasamakliCikarma', 'ikiArtıIkiBasamakliCikarma'];
            exercises.forEach(exercise => {
                const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
        } else if (moduleType === 'carpma') {
            // Çarpma modülündeki tüm alıştırmaları topla
            const exercises = ['birBasamakliCarpma', 'ikiBasamakliCarpma', 'ikiCarpıIkiBasamakli', 'ikiCarpıBirArtıBir', 'akilliCarpimTablosu', 'carpanBulma'];
            exercises.forEach(exercise => {
                const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
            
            // İleri çarpma istatistiklerini de ekle
            const ileriCarpmaNumbers = [15, 25, 50, 75];
            ileriCarpmaNumbers.forEach(number => {
                const exerciseKey = `ileriCarpma_${number}`;
                const stats = exerciseStats[exerciseKey] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
        } else if (moduleType === 'uslu') {
            // Üslü sayılar modülündeki tüm alıştırmaları topla
            const baseNumbers = [2, 3, 4, 5, 6, 7, 8, 9];
            baseNumbers.forEach(baseNumber => {
                // Üslü cevap bulma istatistikleri
                const cevapBulmaKey = `usluCevapBulma_${baseNumber}`;
                const cevapBulmaStats = exerciseStats[cevapBulmaKey] || { total: 0, correct: 0 };
                totalQuestions += cevapBulmaStats.total;
                totalCorrect += cevapBulmaStats.correct;
                
                // Üslü sayı bulma istatistikleri
                const sayiBulmaKey = `usluSayiBulma_${baseNumber}`;
                const sayiBulmaStats = exerciseStats[sayiBulmaKey] || { total: 0, correct: 0 };
                totalQuestions += sayiBulmaStats.total;
                totalCorrect += sayiBulmaStats.correct;
            });
            
            // Karesini alma istatistiklerini de ekle
            const karesiniAlmaExercises = ['kareCevapBulma', 'kareSayiBulma'];
            karesiniAlmaExercises.forEach(exercise => {
                const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
        } else if (moduleType === 'faktoriyel') {
            // Faktöriyel modülündeki tüm alıştırmaları topla
            const faktoriyelExercises = ['faktoriyelCevapBulma1', 'faktoriyelCevapBulma2', 'faktoriyelSayiBulma1', 'faktoriyelSayiBulma2'];
            faktoriyelExercises.forEach(exercise => {
                const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
        } else if (moduleType === 'kesirler') {
            // Kesirler modülündeki tüm alıştırmaları topla
            const kesirlerExercises = ['kesirliYuzde', 'yuzdeliKesir', 'kesirliOndalik', 'yuzdeliOndalik', 'kesirSadelestirme', 'kesirliIslemler', 'kesirliIslemlerBirBasamakli', 'kesirliIslemlerIkiBasamakli', 'kesirPaydaOrtakKati'];
            kesirlerExercises.forEach(exercise => {
                const stats = exerciseStats[exercise] || { total: 0, correct: 0 };
                totalQuestions += stats.total;
                totalCorrect += stats.correct;
            });
        }
        
        if (totalQuestions === 0) return 0;
        return Math.round((totalCorrect / totalQuestions) * 100);
    }

    // Alıştırma doğruluk yüzdesini hesapla
    getExerciseAccuracy(exerciseType) {
        const exerciseStats = this.userStats.exerciseStats || {};
        const exerciseData = exerciseStats[exerciseType] || { total: 0, correct: 0 };
        
        if (exerciseData.total === 0) return 0;
        return Math.round((exerciseData.correct / exerciseData.total) * 100);
    }

    // Doğruluk yüzdesine göre renk sınıfı döndür
    getAccuracyColorClass(accuracy) {
        if (accuracy >= 90) return 'accuracy-excellent';
        if (accuracy >= 75) return 'accuracy-good';
        if (accuracy >= 60) return 'accuracy-average';
        if (accuracy >= 40) return 'accuracy-below-average';
        return 'accuracy-poor';
    }

    // Diziyi karıştır (Fisher-Yates algoritması)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }



    // Tüm istatistikleri sıfırla
    async resetAllStats() {
        if (confirm('Tüm istatistiklerinizi sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            try {
                // IndexedDB'den tüm verileri temizle
                await dbManager.clearDatabase();
                console.log('IndexedDB temizlendi');
                
                // Tüm istatistikleri sıfırla
                this.userStats = {
                    totalQuestions: 0,
                    correctAnswers: 0,
                    incorrectAnswers: 0,
                    questionHistory: {},
                    difficultQuestions: [],
                    moduleStats: {},
                    exerciseStats: {}
                };
                
                // LocalStorage'dan da sil (fallback için)
                localStorage.removeItem('userStats');
                
                // Ana sayfayı yenile
                this.showMainModules();
                
                // Kullanıcıya bilgi ver
                alert('Tüm istatistikler başarıyla sıfırlandı!');
            } catch (error) {
                console.error('İstatistik sıfırlama hatası:', error);
                throw error;
            }
        }
    }
}

// Global modül sistemi instance'ı
const moduleSystem = new ModuleSystem();
