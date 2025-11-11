# 🔗 MitraLink IKM - Backend

## ✨ Outline Proyek
Ini adalah server backend untuk platform MitraLink IKM, dirancang untuk memfasilitasi kemitraan IKM dengan industri besar (SDGs Desa 9.3.1.a).

Dibangun dengan Node.js, Express, dan PostgreSQL, serta menggunakan JWT untuk otentikasi.
---

## 🛠️ Prasyarat

Untuk menjalankan server ini di mode pengembangan (development), Anda memerlukan:
<ol>
  <li>Node.js & npm (v18 atau lebih baru).</li>
  <li>PostgreSQL (Dijalankan secara lokal, hanya untuk setup awal).</li>
  <li>Akun GitHub (untuk otentikasi Railway/Vercel).</li>
  <li>Akses Kredensial Cloud: Anda harus memiliki URL koneksi untuk layanan production Anda:</li>
  <ul>
    <li>Database (Neon): URL koneksi PostgreSQ.</li>
    <li>Storage (Cloudinary): API Key dan Secret.</li>  
    <li>Hosting (Railway): URL publik (domain).</li>
  </ul>  
</ol>


## 🌍 Konfigurasi Variabel Lingkungan

Langkah ini **KRUSIAL** untuk menghubungkan *frontend* lokal Anda ke *backend* yang telah di-deploy.
```bash
# Port Server Lokal
PORT=5000

# Kunci Rahasia untuk Token Login (JWT)
JWT_SECRET=rahasia_anda_yang_sangat_sulit_ditebak

# Kredensial Database PostgreSQL LOKAL Anda (Untuk pengujian DB lokal)
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=mitralink_ikm_local 
DB_PASSWORD=password_pgadmin_anda
DB_PORT=5432

# Kredensial Cloudinary Anda
CLOUDINARY_CLOUD_NAME=isi_cloud_name_anda
CLOUDINARY_API_KEY=isi_api_key_anda
CLOUDINARY_API_SECRET=isi_api_secret_anda
```
## menjalankan aplikasi 
### 3. Mode A : jalankan di lokal 
Pastikan Anda berada di direktori frontend/, lalu jalankan:
```bash
npm run dev
```
Server akan berjalan di http://localhost:5000 dan terhubung ke database lokal Anda (sesuai file .env).

### Mode B: Production (Sudah Deploy)
Mode ini sudah ditangani oleh Railway. Saat Railway men-deploy, ia menggunakan variabel DATABASE_URL yang Anda berikan dan menjalankan:

```bash
# Perintah yang dijalankan Railway
npm start
```
Server ini terhubung ke Neon dan live di domain Railway Anda.
