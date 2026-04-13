Kamu adalah senior fullstack developer.

Bantu saya membuat sistem admin dashboard untuk website saya dengan fitur lengkap dan struktur clean code.

Gunakan stack berikut:
- Backend: Node.js + Express
- Database: SQLite
- ORM: Drizzle ORM
- Authentication: Better Auth
- Frontend Admin: React + shadcn/ui
- Styling: Tailwind CSS

Fitur yang harus ada:

1. Authentication
- Login admin menggunakan email dan password
- Gunakan Better Auth
- Middleware proteksi route admin

2. CRUD Data (contoh: produk)
- Create produk
- Read (list produk)
- Update produk
- Delete produk
- Field: id, nama, deskripsi, harga, created_at

3. API Backend
- Buat REST API dengan struktur:
  - POST /api/products
  - GET /api/products
  - PUT /api/products/:id
  - DELETE /api/products/:id

4. Database
- Gunakan SQLite
- Gunakan Drizzle ORM
- Buat schema tabel produk

5. Admin Dashboard (Frontend)
- Gunakan React + shadcn/ui
- Halaman:
  - Login page
  - Dashboard
  - Halaman CRUD produk

6. Grafik (Chart)
- Tampilkan grafik jumlah produk per hari
- Gunakan chart library yang kompatibel dengan shadcn (misalnya recharts)
- Grafik tampil di dashboard

7. Struktur Project
- Pisahkan folder backend dan frontend
- Gunakan best practice folder structure

8. Bonus:
- Validasi input
- Error handling
- Loading state di frontend

Output yang saya inginkan:
- Struktur folder lengkap
- Code backend (Express + Drizzle + SQLite)
- Setup Better Auth
- Code frontend (React + shadcn)
- Contoh query dan API call
- Cara menjalankan project step by step

Gunakan bahasa yang mudah dipahami oleh pemula, tapi tetap profesional.