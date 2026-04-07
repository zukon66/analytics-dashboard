const tr = {
  // Genel
  app: {
    name: "KÖK-OS",
    tagline: "Analitik Kanvas",
  },

  // Sidebar
  nav: {
    dashboard: "Gösterge Paneli",
    analytics: "Menü Analitiği",
    orders: "Siparişler",
    customers: "Müşteriler",
    settings: "Ayarlar",
  },

  // Upgrade kartı
  upgrade: {
    title: "Pro'ya Geç",
    description: "Derin lokasyon haritaları ve yapay zeka tahminlerini aç.",
    button: "Başla",
  },

  // TopNav
  topNav: {
    searchPlaceholder: "İçgörü ara...",
    userRole: "Restoran Sahibi",
  },

  // Dashboard (Ana sayfa)
  dashboard: {
    title: "Masa & Konum Analitiği",
    subtitle: "Restoran bölgelerinde gerçek zamanlı performans",
    filters: {
      last24h: "Son 24 Saat",
      export: "Dışa Aktar",
    },
    kpis: {
      totalScans: "Bugünkü Toplam Tarama",
      peakHour: "Zirve Saati",
      activeCities: "Aktif Şehir",
      activeZones: "Aktif Bölge",
    },
    hourly: {
      badge: "Saat Analizi",
      title: "Saatlik Taramalar",
      subtitle: "Gün boyunca QR kod tarama dağılımı",
      legend: {
        peak: "Zirve Saati",
        high: "Yoğun Trafik",
        normal: "Normal",
      },
    },
    city: {
      badge: "Coğrafi Analiz",
      title: "Şehire Göre Tarama",
      subtitle: "Son 7 gün",
    },
    zone: {
      badge: "Bölge Dağılımı",
      title: "Bölgeye Göre Tarama",
      subtitle: "Bugünkü dağılım",
      total: "Toplam Bölge Taraması",
    },
    topTables: {
      title: "En İyi Masalar",
      cols: {
        tableId: "Masa ID",
        zone: "Bölge",
        dailyScans: "Günlük Tarama",
        avgDuration: "Ort. Süre",
      },
      empty: "Bugün için henüz tarama verisi yok.",
      highVol: "Yüksek Hacim",
      normal: "Normal",
    },
    inventory: {
      title: "Bölge Envanteri",
      tables: "Masa",
      capacity: "Kapasite Kullanımı",
      highDemand: "Yüksek Talep",
    },
  },

  // Analytics sayfası
  analytics: {
    title: "Menü Analitiği",
    subtitle: "Menü performansı ve tarama trendleri",
    badge: {
      trend: "Trend Analizi",
      weekly: "Haftalık Özet",
      top: "En İyi Saatler",
    },
    weeklyScans: "Bu Hafta Toplam Tarama",
    avgPerDay: "Günlük Ortalama",
    bestDay: "En İyi Gün",
    peakHour: "Zirve Saati",
    hourlyTitle: "Saatlik Tarama Dağılımı",
    cityTitle: "Şehir Bazlı Tarama",
    zoneTitle: "Bölge Bazlı Tarama",
  },

  // Orders sayfası
  orders: {
    title: "Siparişler",
    subtitle: "Masa bazında sipariş geçmişi ve durumları",
    cols: {
      orderId: "Sipariş No",
      tableId: "Masa",
      zone: "Bölge",
      amount: "Tutar",
      status: "Durum",
      time: "Zaman",
    },
    status: {
      completed: "Tamamlandı",
      pending: "Bekliyor",
      cancelled: "İptal",
    },
    empty: {
      title: "Henüz sipariş yok",
      description:
        "Supabase'de orders tablosu oluşturulduktan sonra siparişler burada görünecek.",
    },
    totalRevenue: "Toplam Gelir",
    completedOrders: "Tamamlanan",
    pendingOrders: "Bekleyen",
  },

  // Customers sayfası
  customers: {
    title: "Müşteriler",
    subtitle: "Ziyaretçi profilleri ve sıklık analizi",
    cols: {
      name: "Ad",
      city: "Şehir",
      visits: "Ziyaret",
      lastVisit: "Son Ziyaret",
    },
    empty: {
      title: "Henüz müşteri verisi yok",
      description:
        "Supabase'de customers tablosu oluşturulduktan sonra müşteriler burada görünecek.",
    },
    totalCustomers: "Toplam Müşteri",
    returningCustomers: "Tekrar Gelen",
    newThisWeek: "Bu Hafta Yeni",
  },

  // Settings sayfası
  settings: {
    title: "Ayarlar",
    subtitle: "Hesap ve uygulama tercihlerinizi yönetin",
    sections: {
      profile: "Profil Bilgileri",
      restaurant: "Restoran Ayarları",
      notifications: "Bildirim Tercihleri",
      danger: "Tehlikeli Alan",
    },
    fields: {
      name: "Ad Soyad",
      email: "E-posta",
      restaurantName: "Restoran Adı",
      city: "Şehir",
      timezone: "Saat Dilimi",
    },
    notifications: {
      dailyReport: "Günlük rapor e-postası",
      dailyReportDesc: "Her gün sabah 08:00'de özet rapor al",
      peakAlert: "Zirve saati uyarısı",
      peakAlertDesc: "Yoğun trafik olduğunda bildirim gönder",
      weeklyInsight: "Haftalık içgörü",
      weeklyInsightDesc: "Her Pazartesi haftalık analiz raporu al",
    },
    save: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    saved: "Kaydedildi",
    danger: {
      deleteTitle: "Hesabı Sil",
      deleteDesc:
        "Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinir.",
      deleteButton: "Hesabı Sil",
    },
  },

  // Ortak UI
  common: {
    loading: "Yükleniyor...",
    error: "Veri yüklenemedi. Lütfen sayfayı yenileyin.",
    noData: "Veri bulunamadı.",
    minutes: "dk",
    viewAll: "Tümünü Gör",
    tables: "masa",
  },
};

export default tr;
export type I18n = typeof tr;
