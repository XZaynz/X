// IndexedDB Veritabanı Yönetimi
class DatabaseManager {
    constructor() {
        this.dbName = 'DGSMathDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    // Veritabanını başlat
    async init() {
        try {
            console.log('IndexedDB başlatılıyor...');
            
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                
                request.onerror = () => {
                    console.error('IndexedDB açma hatası:', request.error);
                    reject(request.error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    this.isInitialized = true;
                    console.log('IndexedDB başarıyla başlatıldı');
                    resolve();
                };
                
                request.onupgradeneeded = (event) => {
                    console.log('Veritabanı şeması güncelleniyor...');
                    this.createStores(event.target.result);
                };
            });
        } catch (error) {
            console.error('Veritabanı başlatma hatası:', error);
            throw error;
        }
    }

    // Veri depolarını oluştur
    createStores(db) {
        try {
            // Ana kullanıcı istatistikleri
            if (!db.objectStoreNames.contains('userStats')) {
                const userStatsStore = db.createObjectStore('userStats', { keyPath: 'id', autoIncrement: true });
                userStatsStore.createIndex('userId', 'userId', { unique: true });
                console.log('userStats store oluşturuldu');
            }

            // Soru geçmişi
            if (!db.objectStoreNames.contains('questionHistory')) {
                const questionHistoryStore = db.createObjectStore('questionHistory', { keyPath: 'id', autoIncrement: true });
                questionHistoryStore.createIndex('questionText', 'questionText', { unique: false });
                questionHistoryStore.createIndex('exerciseType', 'exerciseType', { unique: false });
                questionHistoryStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('questionHistory store oluşturuldu');
            }

            // Alıştırma istatistikleri
            if (!db.objectStoreNames.contains('exerciseStats')) {
                const exerciseStatsStore = db.createObjectStore('exerciseStats', { keyPath: 'id', autoIncrement: true });
                exerciseStatsStore.createIndex('exerciseKey', 'exerciseKey', { unique: true });
                console.log('exerciseStats store oluşturuldu');
            }

            // Modül istatistikleri
            if (!db.objectStoreNames.contains('moduleStats')) {
                const moduleStatsStore = db.createObjectStore('moduleStats', { keyPath: 'id', autoIncrement: true });
                moduleStatsStore.createIndex('moduleType', 'moduleType', { unique: true });
                console.log('moduleStats store oluşturuldu');
            }

            // Zor sorular listesi
            if (!db.objectStoreNames.contains('difficultQuestions')) {
                const difficultQuestionsStore = db.createObjectStore('difficultQuestions', { keyPath: 'id', autoIncrement: true });
                difficultQuestionsStore.createIndex('questionText', 'questionText', { unique: true });
                console.log('difficultQuestions store oluşturuldu');
            }

            console.log('Tüm veri depoları oluşturuldu');
        } catch (error) {
            console.error('Veri depoları oluşturma hatası:', error);
            throw error;
        }
    }

    // Kullanıcı istatistiklerini kaydet
    async saveUserStats(userStats) {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['userStats'], 'readwrite');
            const store = transaction.objectStore('userStats');
            
            // Mevcut veriyi kontrol et
            const existingData = await this.getUserStats();
            
            if (existingData) {
                // Güncelle
                const updateRequest = store.put({
                    id: existingData.id,
                    ...userStats,
                    lastUpdated: new Date().toISOString()
                });
                
                return new Promise((resolve, reject) => {
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                });
            } else {
                // Yeni kayıt
                const addRequest = store.add({
                    ...userStats,
                    lastUpdated: new Date().toISOString()
                });
                
                return new Promise((resolve, reject) => {
                    addRequest.onsuccess = () => resolve();
                    addRequest.onerror = () => reject(addRequest.error);
                });
            }
        } catch (error) {
            console.error('Kullanıcı istatistikleri kaydetme hatası:', error);
            throw error;
        }
    }

    // Kullanıcı istatistiklerini getir
    async getUserStats() {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['userStats'], 'readonly');
            const store = transaction.objectStore('userStats');
            const request = store.get(1); // İlk kayıt
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Kullanıcı istatistikleri getirme hatası:', error);
            return null;
        }
    }

    // Soru geçmişini kaydet
    async saveQuestionHistory(questionData) {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['questionHistory'], 'readwrite');
            const store = transaction.objectStore('questionHistory');
            
            const questionRecord = {
                questionText: questionData.questionText,
                exerciseType: questionData.exerciseType,
                isCorrect: questionData.isCorrect,
                timestamp: new Date().toISOString(),
                userAnswer: questionData.userAnswer,
                correctAnswer: questionData.correctAnswer
            };
            
            const addRequest = store.add(questionRecord);
            
            return new Promise((resolve, reject) => {
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            });
        } catch (error) {
            console.error('Soru geçmişi kaydetme hatası:', error);
            throw error;
        }
    }

    // Alıştırma istatistiklerini kaydet
    async saveExerciseStats(exerciseKey, stats) {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['exerciseStats'], 'readwrite');
            const store = transaction.objectStore('exerciseStats');
            
            // Mevcut istatistikleri kontrol et
            const index = store.index('exerciseKey');
            const request = index.get(exerciseKey);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const existingStats = request.result;
                    
                    if (existingStats) {
                        // Güncelle
                        const updateRequest = store.put({
                            id: existingStats.id,
                            exerciseKey,
                            ...stats,
                            lastUpdated: new Date().toISOString()
                        });
                        
                        updateRequest.onsuccess = () => resolve();
                        updateRequest.onerror = () => reject(updateRequest.error);
                    } else {
                        // Yeni kayıt
                        const addRequest = store.add({
                            exerciseKey,
                            ...stats,
                            lastUpdated: new Date().toISOString()
                        });
                        
                        addRequest.onsuccess = () => resolve();
                        addRequest.onerror = () => reject(addRequest.error);
                    }
                };
                
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Alıştırma istatistikleri kaydetme hatası:', error);
            throw error;
        }
    }

    // Alıştırma istatistiklerini getir
    async getExerciseStats(exerciseKey) {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['exerciseStats'], 'readonly');
            const store = transaction.objectStore('exerciseStats');
            const index = store.index('exerciseKey');
            const request = index.get(exerciseKey);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Alıştırma istatistikleri getirme hatası:', error);
            return null;
        }
    }

    // Tüm alıştırma istatistiklerini getir
    async getAllExerciseStats() {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['exerciseStats'], 'readonly');
            const store = transaction.objectStore('exerciseStats');
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Tüm alıştırma istatistikleri getirme hatası:', error);
            return [];
        }
    }

    // Zor soruları kaydet
    async saveDifficultQuestions(questions) {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['difficultQuestions'], 'readwrite');
            const store = transaction.objectStore('difficultQuestions');
            
            // Mevcut zor soruları temizle
            const clearRequest = store.clear();
            
            return new Promise((resolve, reject) => {
                clearRequest.onsuccess = () => {
                    // Yeni zor soruları ekle
                    if (questions && questions.length > 0) {
                        const promises = questions.map(question => {
                            return store.add({
                                questionText: question,
                                timestamp: new Date().toISOString()
                            });
                        });
                        
                        Promise.all(promises)
                            .then(() => resolve())
                            .catch(error => reject(error));
                    } else {
                        resolve();
                    }
                };
                
                clearRequest.onerror = () => reject(clearRequest.error);
            });
        } catch (error) {
            console.error('Zor sorular kaydetme hatası:', error);
            throw error;
        }
    }

    // Zor soruları getir
    async getDifficultQuestions() {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction(['difficultQuestions'], 'readonly');
            const store = transaction.objectStore('difficultQuestions');
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const questions = request.result.map(item => item.questionText);
                    resolve(questions);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Zor sorular getirme hatası:', error);
            return [];
        }
    }

    // localStorage'dan veri aktarımı
    async migrateFromLocalStorage() {
        try {
            console.log('localStorage\'dan veri aktarımı başlıyor...');
            
            const userStats = localStorage.getItem('userStats');
            if (userStats) {
                const parsedStats = JSON.parse(userStats);
                await this.saveUserStats(parsedStats);
                
                // localStorage'ı temizle
                localStorage.removeItem('userStats');
                console.log('localStorage verisi başarıyla aktarıldı');
            }
            
            console.log('Veri aktarımı tamamlandı');
        } catch (error) {
            console.error('Veri aktarımı hatası:', error);
            throw error;
        }
    }

    // Veritabanını temizle
    async clearDatabase() {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction([
                'userStats', 'questionHistory', 'exerciseStats', 
                'moduleStats', 'difficultQuestions'
            ], 'readwrite');
            
            const promises = [
                transaction.objectStore('userStats').clear(),
                transaction.objectStore('questionHistory').clear(),
                transaction.objectStore('exerciseStats').clear(),
                transaction.objectStore('moduleStats').clear(),
                transaction.objectStore('difficultQuestions').clear()
            ];
            
            await Promise.all(promises);
            console.log('Veritabanı temizlendi');
        } catch (error) {
            console.error('Veritabanı temizleme hatası:', error);
            throw error;
        }
    }

    // Veritabanı boyutunu getir
    async getDatabaseSize() {
        try {
            if (!this.isInitialized) await this.init();
            
            const transaction = this.db.transaction([
                'userStats', 'questionHistory', 'exerciseStats', 
                'moduleStats', 'difficultQuestions'
            ], 'readonly');
            
            const promises = [
                transaction.objectStore('userStats').count(),
                transaction.objectStore('questionHistory').count(),
                transaction.objectStore('exerciseStats').count(),
                transaction.objectStore('moduleStats').count(),
                transaction.objectStore('difficultQuestions').count()
            ];
            
            const counts = await Promise.all(promises);
            
            return {
                userStats: counts[0],
                questionHistory: counts[1],
                exerciseStats: counts[2],
                moduleStats: counts[3],
                difficultQuestions: counts[4],
                total: counts.reduce((sum, count) => sum + count, 0)
            };
        } catch (error) {
            console.error('Veritabanı boyutu getirme hatası:', error);
            return null;
        }
    }
}

// Global veritabanı yöneticisi
const dbManager = new DatabaseManager();

// Sayfa yüklendiğinde veritabanını başlat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dbManager.init();
        console.log('Veritabanı başlatıldı');
        
        // localStorage'dan veri aktarımı (sadece bir kez)
        const hasMigrated = localStorage.getItem('indexedDBMigrated');
        if (!hasMigrated) {
            await dbManager.migrateFromLocalStorage();
            localStorage.setItem('indexedDBMigrated', 'true');
            console.log('Veri aktarımı tamamlandı ve işaretlendi');
        } else {
            console.log('Veri aktarımı zaten yapılmış');
        }
    } catch (error) {
        console.error('Veritabanı başlatma hatası:', error);
    }
});
