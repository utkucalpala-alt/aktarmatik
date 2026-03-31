# AKTARMATIK - Proje Dokumantasyonu v2
**Yedek Tarihi:** 29.03.2026
**Deploy:** https://aktarmatik.webtasarimi.net
**Admin Panel:** https://aktarmatikadmin.webtasarimi.net (veya /admin path)
**Dokploy:** https://dokploy.webtasarimi.net
**Repo:** https://github.com/utkucalpala-alt/aktarmatik.git

---

## Proje Nedir?
Aktarmatik, Trendyol'daki urun verilerini (yorumlar, puanlar, sosyal kanit) scrape edip ikas/Shopify/WordPress/IdeaSoft gibi e-ticaret sitelerine widget olarak gosterir.

## Gelir Modeli
- 1 urun ucretsiz
- Ek urunler 29 TL/urun/ay

---

## Teknik Yapi

### Stack
- **Framework:** Next.js 16 (App Router)
- **Veritabani:** PostgreSQL
- **Scraper:** Puppeteer (headless Chrome)
- **Deploy:** Dokploy (Docker, self-hosted)
- **Domain:** aktarmatik.webtasarimi.net + aktarmatikadmin.webtasarimi.net

### Dosya Yapisi

```
app/
  page.js                    # Landing page (yeni tasarim)
                              # Hero + widget demo + 3 adim rehber + ozellikler + fiyatlandirma
  layout.js                  # Root layout
  giris/page.js              # Login sayfasi
  kayit/page.js              # Register sayfasi

  panel/                     # KULLANICI PANELI
    layout.js                # Sidebar: Genel Bakis, URL Esleme, Entegrasyon
    page.js                  # Dashboard - istatistikler
    barkodlar/page.js        # URL Esleme sayfasi (Trendyol + site URL eslemesi)
    widget/page.js           # Entegrasyon sayfasi
                              # Platform secici (ikas/Shopify/WordPress/IdeaSoft)
                              # Platforma ozel kurulum rehberi
                              # Tema secimi, entegrasyon kodu, eslesen urunler
    urun/[id]/page.js        # Urun detay sayfasi

  admin/                     # ADMIN PANELI (morfilmedia icin)
    layout.js                # Admin sidebar: Dashboard, Uyeler, Urunler
    page.js                  # Admin dashboard - istatistik kartlari
    uyeler/page.js           # Uye yonetimi - plan/hediye guncelleme
    uye/[id]/page.js         # Uye detay - urunleri, plan degistirme
    urunler/page.js          # Tum urunler listesi

  api/
    auth/route.js            # Login/Register API
                              # morfilmedia@gmail.com otomatik admin + unlimited
    barcodes/route.js        # Urun CRUD (barcode artik opsiyonel, URL bazli)
    scrape/route.js          # Trendyol scraping tetikleyici
    widget/
      by-url/route.js        # Widget API - site URL ile urun eslestirir (ILIKE)
      by-barcode/[barcode]/route.js  # Eski barcode API
    admin/
      stats/route.js         # Admin istatistikler
      users/route.js         # Admin uye listele/guncelle (GET/PATCH)
      users/[id]/route.js    # Admin uye detay

public/
  widget-auto.js             # Ana widget scripti
                              # URL esleme ile veri ceker
                              # Sosyal kanit (donen mesajlar), yorumlar, soru-cevap
                              # 5 yildizli rastgele yorum, tavsiye orani

lib/
  scraper.js                 # Puppeteer ile Trendyol scraper
  db.js                      # PostgreSQL baglantisi
  init-db.js                 # Veritabani sema + migration
  auth.js                    # JWT auth + getAdminFromRequest()

middleware.js                # Domain bazli yonlendirme
                              # aktarmatikadmin.* → /admin rewrite
```

### Veritabani Tablolari
- `tp_users` - id, email, password_hash, name, plan, role, gift_products, created_at
- `tp_barcodes` - id, user_id, barcode, product_name, product_url, site_url, status
- `tp_product_data` - rating, review_count, favorite_count, cart_count, sold_count
- `tp_reviews` - author, rating, content, review_date
- `tp_questions` - user_name, question_text, answer_text, question_date
- `tp_ai_analysis` - summary, sentiment, pros, cons
- `tp_widgets` - token, widget_type, theme, accent_color

### Widget Ozellikleri (widget-auto.js)
1. Puan satiri - Yildizlar + degerlendirme sayisi + soru-cevap sayisi
2. Kullanicilar Begeniyor rozeti
3. Donen sosyal kanit mesajlari (her 3.5 saniyede)
4. Tavsiye orani - puan x 20 = yuzde
5. En Faydali Yorum - 5 yildizli rastgele yorum
6. Yorumlar ve Soru-Cevap sekmeleri

### URL Esleme Akisi
- Widget sayfanin URL'sini alir
- /api/widget/by-url endpointine gonderir
- tp_barcodes.site_url uzerinde ILIKE ile eslestirir
- Eslesen urunun tum verilerini dondurur

### Admin Sistemi
- morfilmedia@gmail.com → otomatik admin + unlimited (login sirasinda)
- Admin paneli: /admin (veya aktarmatikadmin.webtasarimi.net)
- Uye yonetimi: plan degistirme (free/pro/unlimited), hediye urun atama
- Tum urunleri ve uyeleri gorebilme

### Desteklenen Platformlar
- ikas (otomatik entegrasyon)
- Shopify (theme.liquid)
- WordPress (footer.php veya eklenti)
- IdeaSoft (tema kod duzenleyici)

---

## Onemli Notlar
- Barcode esleme kaldirildi, sadece URL esleme kullaniliyor
- Widget scripti tek satirlik kod ile eklenir
- Scraper Trendyol sayfasini Puppeteer ile acar
- Sosyal kanit mesajlari sadece veride olan bilgileri gosterir
- Tavsiye orani puandan turetilir (4.8 x 20 = %96)
- Tekil widget kaldirildi, sadece otomatik entegrasyon var
