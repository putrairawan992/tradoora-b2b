# Dokumentasi Proyek Tradoora B2B

Dokumen ini memuat panduan untuk pengaturan dan instalasi proyek **Tradoora B2B**. Ikuti langkah-langkah di bawah untuk memastikan proyek berjalan dengan baik di lingkungan lokal Anda.

---

## 📋 Persyaratan Sistem

Sebelum memulai instalasi, pastikan sistem Anda memenuhi persyaratan berikut:

* **Node.js**: Versi `v20.18.0`
* **Git/GitHub**
* **Bun.js**: Versi `1.1.20`
* **VS Code**
* **Akun Supabase**
* **NGROK**
* **Akun Midtrans**

---

## 🚀 Instalasi

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek:

### 1. Clone Repositori

```bash
git clone https://github.com/akufikri/tradoora-b2b.git
```

### 2. Masuk ke Direktori Proyek

```bash
cd tradoora-b2b
```

### 3. Instal Dependensi (Root Workspace)

```bash
bun install
```

### 4. Instal Dependensi Frontend

```bash
cd apps/frontend
bun install
cd ../.. # Kembali ke root
```

### 5. Instal Dependensi Backend

```bash
cd apps/backend
bun install
cd ../.. # Kembali ke root
```

---

## ⚙️ Konfigurasi Environment (.env)

### Backend

1. Salin file `.env.example` menjadi `.env`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

2. Edit file `.env` dan sesuaikan variabel berikut:

```env
APP_URL="https://tradoora-b2b.onrender.com" 
JWT_SECRET=TRADOORA4436

DATABASE_URL="postgresql://postgres.dgwhekppvgprrvdbbesb:pRI2W4I6mtJvhW2y@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.dgwhekppvgprrvdbbesb:pRI2W4I6mtJvhW2y@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

MIDTRANS_MERCHANT_ID=G159254507
MIDTRANS_CLIENT_ID=SB-Mid-client-WC7KXAkKVB_rOcjm
MIDTRANS_SERVER_KEY=SB-Mid-server-j70KQihKUnU6Q4cCdIF6Ee0l
MIDTRANS_MODE=sandbox
```

> 💡 **Catatan:** Gantilah semua nilai environment di atas dengan kredensial Anda sendiri dari Supabase dan Midtrans.

3. Masuk ke directory apps/backend/src/index.ts
```
const allowedOrigins = [
  'http://localhost:5173', <-- JANGAN LUPA MASUKAN URL FRONTEND UNTUK PERMISSION CORS
  process.env.FRONTEND_URL,
].filter((origin): origin is string => !!origin);

```

---

### Frontend

1. Salin file `.env.example` menjadi `.env`:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

2. Tambahkan variabel lingkungan tambahan jika diperlukan, misalnya:

```env
VITE_API_URL=https://tradoora-b2b.onrender.com <-- Gantikan dengan url backend local
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-WC7KXAkKVB_rOcjm
```

---

## 🧲 Menjalankan Proyek

Setelah semua dependensi terinstal dan konfigurasi `.env` selesai, Anda dapat menjalankan proyek.

### Menjalankan Backend

```bash
cd apps/backend
bun dev
```

### Menjalankan Frontend

```bash
cd apps/frontend
bun dev
```

---

## ✅ Selesai

Sekarang Anda siap menggunakan **Tradoora B2B** di lingkungan lokal! 🚀
