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
    growth: "Büyüme",
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
    userRole: "Operatör",
  },

  // Platform Overview (ana sayfa)
  platform: {
    title: "Platform Genel Bakış",
    subtitle: "Tüm işletmelerin anlık performansı",
    kpis: {
      totalBusinesses: "Toplam İşletme",
      activeBusinesses: "Aktif İşletme",
      churnRisk: "Pasif İşletmeler",
      scansToday: "Bugünkü Tarama",
      scansWeek: "Haftalık Tarama",
      totalRevenue: "Toplam Gelir",
    },
    churnSection: "Pasif İşletmeler — Aksiyon Gerekli",
    churnEmpty: "14 gün içinde hareketsiz işletme yok.",
    topBusinesses: "En Aktif İşletmeler (Son 7 Gün)",
    viewAll: "Tüm İşletmeler",
  },

  // Businesses (işletme listesi)
  businesses: {
    title: "İşletmeler",
    subtitle: "Platform müşterileri ve kullanım durumları",
    cols: {
      name: "İşletme",
      city: "Şehir",
      plan: "Plan",
      status: "Durum",
      scans7d: "Haftalık Tarama",
      lastActive: "Son Aktif",
    },
    status: {
      active: "Aktif",
      inactive: "Pasif",
      churned: "Ayrıldı",
      trial: "Deneme",
    },
    empty: "İşletme bulunamadı.",
    detail: "Detay",
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
    subtitle: "Platform yöneticisi tercihlerinizi yönetin",
    sections: {
      profile: "Yönetici Profili",
      restaurant: "Platform Ayarları",
      notifications: "Bildirim Tercihleri",
      danger: "Tehlikeli Alan",
    },
    fields: {
      name: "Ad Soyad",
      email: "E-posta",
      restaurantName: "Platform Adı",
      city: "Bölge / Şehir",
      timezone: "Saat Dilimi",
    },
    notifications: {
      dailyReport: "Günlük platform raporu",
      dailyReportDesc: "Her gün sabah 08:00'de tüm işletmelerin özetini al",
      peakAlert: "Pasif işletme uyarısı",
      peakAlertDesc: "14 gün hareketsiz kalan işletmeler için bildirim gönder",
      weeklyInsight: "Haftalık platform özeti",
      weeklyInsightDesc: "Her Pazartesi platform geneli haftalık analiz raporu",
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

  // Growth (Büyüme Paneli)
  growth: {
    title: "Büyüme Paneli",
    subtitle: "MRR trendi, trial takibi, yeni kayıtlar ve aktivasyon hunisi",
    mrr: {
      badge: "Gelir Analizi",
      title: "MRR Trendi — Son 12 Ay",
      subtitle: "Tamamlanan sipariş gelirleri aylık bazda",
      currentMrr: "Anlık MRR",
      currentMrrSub: "Plan ücretlerinden hesaplandı",
      noData: "Henüz tamamlanan sipariş verisi yok.",
      planBreakdown: "Plan Bazlı Dağılım",
    },
    trial: {
      badge: "Trial Takibi",
      title: "Yaklaşan Trial Bitişleri",
      subtitle: "14 gün içinde trial'ı dolacak işletmeler",
      cols: {
        name: "İşletme",
        city: "Şehir",
        email: "E-posta",
        daysRemaining: "Kalan Gün",
      },
      today: "Bugün bitiyor",
      daysLeft: "gün kaldı",
      empty: "Yaklaşan trial bitişi bulunmuyor.",
    },
    newBiz: {
      badge: "Yeni Kayıtlar",
      title: "Son 30 Günde Kayıt Olan İşletmeler",
      subtitle: "Kayıt akışı ve ilk aktivasyon durumu",
      cols: {
        name: "İşletme",
        city: "Şehir",
        plan: "Plan",
        registered: "Kayıt Tarihi",
        firstScan: "İlk Tarama",
      },
      activated: "Tarama Yapıldı",
      notActivated: "Henüz Yok",
      empty: "Son 30 günde yeni kayıt yok.",
    },
    funnel: {
      badge: "Aktivasyon Hunisi",
      title: "Aktivasyon Hunisi",
      subtitle: "Kayıttan güçlü kullanıcıya dönüşüm",
      stages: {
        registered: "Kayıtlı İşletme",
        activated: "Aktifleşti (1+ Tarama)",
        powerUser: "Güçlü Kullanıcı (10+)",
      },
      conversion: "dönüşüm",
    },
    summaryCard: {
      title: "Büyüme Özeti",
      trialWarnings: "Yaklaşan Trial",
      newSignups: "Yeni Kayıt (30G)",
      activationRate: "Aktivasyon Oranı",
      viewAll: "Büyüme Panelini Gör",
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
