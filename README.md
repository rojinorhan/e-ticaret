# 🛒 E-Commerce

ASP.NET Core Web API ve React kullanılarak geliştirilmiş modern bir e-ticaret uygulamasıdır.

Proje; kullanıcıların ürünleri inceleyebilmesi, sepete ürün ekleyebilmesi, sipariş oluşturabilmesi ve ödeme işlemi gerçekleştirebilmesi üzerine kurulmuştur. Ayrıca yöneticiler için ürün, kategori, kullanıcı ve sipariş yönetiminin yapılabildiği bir admin paneli bulunmaktadır.

## 🚀 Kullanılan Teknolojiler

### Backend

* ASP.NET Core Web API
* .NET 9
* Entity Framework Core
* SQLite
* RESTful API
* Dependency Injection
* DTO
* Service Layer
* JWT Authentication
* Role-Based Authorization

### Frontend

* React
* JavaScript
* React Router
* Axios
* SweetAlert2
* CSS

## 📌 Temel Özellikler

### 👤 Kullanıcı İşlemleri

* Kullanıcı kayıt ve giriş işlemleri
* JWT tabanlı kimlik doğrulama
* Kullanıcı yetkilendirme
* Kullanıcı profil işlemleri

### 🛍️ Ürün İşlemleri

* Ürünleri listeleme
* Ürün detaylarını görüntüleme
* Kategori bazlı ürün listeleme
* Ürün arama
* Stok kontrolü

### 🛒 Sepet

* Sepete ürün ekleme
* Ürün adetini artırma/azaltma
* Sepetten ürün silme
* Sepeti temizleme
* Toplam sepet tutarını hesaplama

### 📦 Sipariş

* Sepetten sipariş oluşturma
* Sipariş geçmişini görüntüleme
* Sipariş durumunu takip etme
* Admin tarafından sipariş durumunu değiştirme

Sipariş durumları:

* Bekliyor
* Onaylandı
* Kargoda
* Teslim Edildi
* İptal Edildi

### 💳 Ödeme

Projede gerçek ödeme sistemi yerine geliştirme/test amacıyla **mock ödeme sistemi** kullanılmıştır.

Test kartı:

```text
Kart: 5555 5555 5555 4444
Son Kullanma: 12/30
CVV: 123
```

Başarılı ödeme sonrasında sipariş otomatik olarak **Onaylandı** durumuna geçirilir.

### 🧑‍💼 Admin Paneli

Admin panel üzerinden:

* Dashboard
* Ürün yönetimi
* Kategori yönetimi
* Sipariş yönetimi
* Kullanıcı yönetimi

işlemleri gerçekleştirilebilir.

Admin sipariş ekranında:

* Siparişleri listeleme
* Duruma göre filtreleme
* Sipariş arama
* Sipariş detaylarını görüntüleme
* Sipariş durumunu değiştirme

özellikleri bulunmaktadır.

### 📊 Dashboard

Admin dashboard üzerinde temel satış ve sistem istatistikleri gösterilmektedir.

Örneğin:

* Toplam satış
* Sipariş sayısı
* Kullanıcı sayısı
* Ürün sayısı
* Kategori sayısı
* Düşük stoklu ürünler
* Sipariş durumları
* Günlük satış bilgileri

## 🏗️ Proje Yapısı

Proje backend tarafında katmanlı bir yapıya uygun olarak düzenlenmiştir.

```text
ECommerce.Api
│
├── Controllers
├── Services
├── Interfaces
├── DTOs
├── Data
│   ├── Auth
│   ├── Configurations
│   ├── Entities
│   ├── Kategori
│   ├── Sepet
│   ├── Siparis
│   └── Urun
│
├── Middleware
├── Helpers
├── Migrations
│
└── Program.cs
```

Frontend tarafında React component yapısı ve sayfa bazlı organizasyon kullanılmaktadır.

## 🔄 Genel Çalışma Mantığı

Uygulamanın temel veri akışı genel olarak:

```text
React Frontend
      ↓
Axios / API
      ↓
ASP.NET Core Controller
      ↓
Service
      ↓
Entity Framework Core
      ↓
SQLite Database
```

Örneğin sipariş oluşturma işlemi:

```text
Kullanıcı
   ↓
Sepet
   ↓
Sipariş Oluştur
   ↓
Order API
   ↓
OrderService
   ↓
Database
```

Ödeme işlemi başarılı olduğunda:

```text
Ödeme Formu
     ↓
Payment API
     ↓
PaymentService
     ↓
Ödeme kontrolü
     ↓
Sipariş durumu → Confirmed
```

## 🔐 Güvenlik

Projede kullanıcı kimlik doğrulaması için **JWT** kullanılmaktadır.

Admin işlemleri ise role-based authorization ile korunmaktadır.

Örneğin admin sipariş durumunu değiştiren endpoint yalnızca Admin rolüne sahip kullanıcılar tarafından kullanılabilir.

```csharp
[Authorize(Roles = "Admin")]
```

## ⚙️ Kurulum

Projeyi çalıştırmak için:

### Backend

```bash
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

Backend varsayılan olarak:

```text
http://localhost:5091
```

üzerinden çalışmaktadır.

### Frontend

Frontend klasöründe:

```bash
npm install
npm run dev
```

React uygulaması Vite üzerinden çalıştırılmaktadır.

## 🧪 Geliştirme Durumu

Projenin temel e-ticaret fonksiyonları geliştirilmiştir.

### Tamamlananlar

* [x] Kullanıcı sistemi
* [x] JWT Authentication
* [x] Ürün yönetimi
* [x] Kategori yönetimi
* [x] Sepet sistemi
* [x] Sipariş sistemi
* [x] Mock ödeme sistemi
* [x] Admin paneli
* [x] Admin sipariş yönetimi
* [x] Dashboard
* [x] Sipariş durum yönetimi
* [x] Stok kontrolü

### Planlanan Geliştirmeler

* [ ] Ürün değerlendirme ve yıldız sistemi
* [ ] Kupon sistemi
* [ ] İndirim sistemi
* [ ] Kargo takip sistemi
* [ ] PDF fatura
* [ ] Gelişmiş admin raporları
* [ ] Admin bildirim sistemi
* [ ] Kullanıcı detay sayfası
* [ ] E-posta bildirimleri
* [ ] Unit / Integration testleri
* [ ] Docker desteği

## 🎯 Projenin Amacı

Bu proje ile modern bir e-ticaret uygulamasının frontend ve backend süreçlerinin birlikte geliştirilmesi, REST API kullanımı, veritabanı işlemleri, authentication/authorization, servis tabanlı yapı ve admin paneli yönetimi konusunda pratik deneyim kazanılması amaçlanmıştır.

---

**Geliştirici:** Rojin Orhan

**Proje:** E-Commerce
**Backend:** ASP.NET Core Web API
**Frontend:** React
**Database:** SQLite
