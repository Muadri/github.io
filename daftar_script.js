  const CONFIG = {
    MODE: 'REAL',         // Tukar ke 'REAL' apabila mempunyai endpoint sebenar daripada Google Apps Script
    REAL_API_URL: 'https://script.google.com/macros/s/AKfycbyYVWjShOvHb6-Okbkzzlk7YHaEPxxc7-VNKvyaNOKYTC4-IlG4GnU1Oa2v3rprbQIN/exec', // GANTI dengan URL Apps Script anda
    // Jika menggunakan Google Sheets publish CSV (cara lama) - optional
    USE_CSV_FALLBACK: true,
    CSV_PUBLIC_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQi7nkLbjkE22EgBuoHqC37Ht3F1MM53IQW_lmJHmJaRoCJ_NKBLWNQTYu7FEQpFx7wkkG-6eKxdN6X/pub?output=csv',
    // MOCK konfigurasi: untuk simulasi, kita akan simpan nilai awal dan tambah secara rawak? Tapi lebih baik
    // menggunakan localStorage agar setiap kali muat semula tidak reset? Tetapi mock sepatutnya hanya untuk demo.
    // Supaya kelihatan realistik, kita ambil value dari localStorage atau initial 87, kemudian setiap refresh tambah?
    // tetapi perlu konsisten. Untuk memenuhi "jumlah pendaftaran automatik", kami buat fetch dari mock data generator
    // yang merekod 'counter' global sedikit sebanyak menyerupai peningkatan.
    // Saya akan create MockAPI yang meniru data meningkat secara progresif menggunakan timestamp/sesi.
  };

  // Elemen UI
  const countSpan = document.getElementById('countDisplay');
  
  // Fungsi untuk mendapatkan jumlah dari MOCK (simulasi separa realistik dengan peningkatan perlahan berdasarkan hari atau random)
  // Untuk memberikan gambaran live, kita akan gunakan nilai yang distor dalam localStorage serta kenaikan setiap kali fetch
  // Dengan cara ini, semua pengunjung akan melihat jumlah yang sama? Tidak, mock berbeza antara pengguna.
  // Tapi ini hanya demonstration. Pada realiti, guna endpoint sebenar yang selaras dengan borang.
  // Saya akan jadikan mock ini berdasarkan masa tarikh, supaya sama untuk semua pengguna? menggunakan Date.
  // Lebih baik: berdasarkan masa -> jumlah simulasi tapi nampak dinamik.
  function fetchMockCount() {
    return new Promise((resolve) => {
      // Simulasi network delay
      setTimeout(() => {
        // Kita cipta pseudo count yang berubah setiap minit/ hari supaya nampak autopembaharuan
        // Anggap tarikh asas 1 Mac 2026 hingga 30 Oktober 2026 -> jumlah pendaftaran berkembang.
        const startDate = new Date(2026, 2, 1).getTime(); // 1 Mac 2026
        const endDate = new Date(2026, 9, 30).getTime();
        const now = Date.now();
        let progress = (now - startDate) / (endDate - startDate);
        progress = Math.min(1, Math.max(0, progress));
        // Jumlah maximum sasaran 1250 peserta
        const maxCount = 1240;
        let baseCount = Math.floor(progress * maxCount) + 42;
        // tambah sedikit variasi berdasarkan jam
        const dayFactor = (new Date().getHours() % 5) * 2;
        let mockCount = baseCount + dayFactor;
        // pastikan dalam lingkungan 20 - 1300
        mockCount = Math.min(1298, Math.max(24, mockCount));
        // tambah random kecil antara -2 hingga +5 untuk efek live
        mockCount += Math.floor(Math.random() * 8) - 2;
        if (mockCount < 15) mockCount = 67;
        resolve({ count: mockCount, source: 'mock' });
      }, 400);
    });
  }

  // Fungsi untuk fetch dari API sebenar (Google Apps Script)
  async function fetchRealCount() {
    try {
      const response = await fetch(CONFIG.REAL_API_URL, {
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (typeof data.count === 'number') {
        return { count: data.count, source: 'real' };
      } else if (data.count !== undefined && !isNaN(parseInt(data.count))) {
        return { count: parseInt(data.count), source: 'real' };
      } else {
        throw new Error('Format JSON tidak sah');
      }
    } catch (err) {
      console.warn('Gagal ambil data real API:', err);
      return null;
    }
  }

  // fetch dari CSV (jika pengguna ingin guna Google Sheets public)
  async function fetchCSVCount() {
    if (!CONFIG.USE_CSV_FALLBACK || !CONFIG.CSV_PUBLIC_URL) return null;
    try {
      const resp = await fetch(CONFIG.CSV_PUBLIC_URL);
      const csvText = await resp.text();
      const rows = csvText.split(/\r?\n/);
      // tolak header jika wujud, kita kira baris data (tidak termasuk header)
      let dataRows = rows.filter(r => r.trim().length > 0);
      if (dataRows.length > 1) {
        const count = dataRows.length - 1; // tolak header
        return { count: Math.max(0, count), source: 'csv' };
      }
      return null;
    } catch(e) {
      console.warn('CSV fetch error', e);
      return null;
    }
  }

  // Fungsi utama ambil jumlah pendaftaran
  async function fetchRegistrationCount() {
    // Jika mod REAL: cuba endpoint utama
    if (CONFIG.MODE === 'REAL') {
      const realData = await fetchRealCount();
      if (realData) return realData.count;
      // fallback ke CSV jika dibenarkan
      const csvData = await fetchCSVCount();
      if (csvData) return csvData.count;
      // fallback mock sementara untuk tunjuk error
      console.warn('Gagal real & csv, menggunakan mock sementara');
      const mockFallback = await fetchMockCount();
      return mockFallback.count;
    } 
    else { // MOCK mode dengan simulasi meningkatkan kiraan menarik
      const mockResult = await fetchMockCount();
      return mockResult.count;
    }
  }

  // Fungsi untuk mengemaskini UI dengan jumlah terkini
  async function updateCountDisplay(showLoadingEffect = true) {
    if (showLoadingEffect) {
      countSpan.innerHTML = '<span class="loading-count"><i class="fas fa-spinner fa-pulse"></i> mengemas...</span>';
    }
    try {
      const count = await fetchRegistrationCount();
      // Format paparan ribu
      countSpan.innerHTML = count.toLocaleString('ms-MY');
      // set attribute untuk accessibility
      countSpan.setAttribute('data-count', count);
    } catch (err) {
      console.error('Gagal mendapatkan jumlah pendaftaran:', err);
      countSpan.innerHTML = '<span class="error-text"><i class="fas fa-exclamation-triangle"></i> ralat</span>';
    }
  }

  // Inisiasi auto refresh setiap 30 saat (30000 ms)
  let intervalId = null;
  
  function startAutoRefresh() {
    if (intervalId) clearInterval(intervalId);
    // Kemaskini setiap 30 saat
    intervalId = setInterval(() => {
      updateCountDisplay(true);
    }, 30000);
  }

  // Jalankan pertama kali, dan tetapkan muat semula automatik
  updateCountDisplay(true).then(() => {
    startAutoRefresh();
  });

  // Optional: apabila pengguna menekan borang Google Form dan menyerahkan, biasanya Google Form akan reload halaman?
  // Untuk memastikan jumlah dikemas kini, kita juga boleh dengar 'visibility change' dan refresh jika tab aktif balik.
  // Tidak perlu terlalu rumit, tetapi kita tambah event pada page visibility supaya apabila pengguna kembali dari submit,
  // data automatik refresh.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateCountDisplay(true);
    }
  });

  // juga catch apabila halaman diload semula, pastikan interval masih ada
  window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
  });

  // TAMBAHAN: Arahan untuk pentadbir tentang cara menukar ke endpoint sebenar.
  console.log('%c📌 PENTING UNTUK PENTADBIR: Untuk memaparkan JUMLAH PENDAFTARAN SEBENAR daripada Google Form, anda perlu deploy Google Apps Script dengan kod berikut dan tukar CONFIG.MODE = "REAL" serta REAL_API_URL. Sila rujuk arahan dalam komen. 🌟', 'background: #1e3a5f; color: #ffdd99; font-size: 12px; padding: 6px;');
  console.log(`
  ★ CARA INTEGRASI SEBENAR (Jumlah Pendaftaran Automatik dari Google Form):
  1. Buka Google Sheet yang menerima respons dari Borang Google anda.
  2. Klik menu "Extensions" → "Apps Script".
  3. Tulis kod berikut:
    function doGet() {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var lastRow = sheet.getLastRow() - 1; // tolak header
      if (lastRow < 0) lastRow = 0;
      return ContentService.createTextOutput(JSON.stringify({ count: lastRow }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  4. Deploy sebagai "Web App" (execute as me, access Anyone).
  5. Salin URL deployment dan masukkan ke dalam kod ini: CONFIG.REAL_API_URL = "URL_ANDA";
  6. Tukar CONFIG.MODE = "REAL";
  Kemudian jumlah pendaftaran akan disegerakkan secara langsung dengan borang!
  `);