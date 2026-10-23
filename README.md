# M14-US1 Frontend — T11

Prototipe frontend awal untuk task T11: halaman daftar dan pencarian karyawan untuk pengaturan gaji.

## Teknologi

- React
- TypeScript
- Vite
- CSS biasa dengan design tokens dari Panduan UI Capstone
- Lucide React untuk ikon

## Menjalankan proyek

Pastikan Node.js LTS sudah terpasang, lalu buka terminal di folder proyek dan jalankan:

```bash
npm install
npm run dev
```

Buka alamat lokal yang muncul di terminal, biasanya `http://localhost:5173`.

## Build untuk memeriksa kesalahan

```bash
npm run build
```

## Catatan

- Data karyawan masih berupa mock data di `src/App.tsx`.
- Belum ada backend, API, autentikasi, atau database.
- T11 berfokus pada daftar dan pencarian karyawan serta melihat status komponen gaji.
- Form tambah/edit komponen gaji dikerjakan pada task T12.
- Sebelum digabung ke repository tim, konfirmasikan stack dengan Scrum Master.
- Warna, tipografi, jarak, dan layout mengacu pada Panduan UI Bersama v1.0.


## Struktur data frontend

- `src/types/employee.ts`: tipe data karyawan dan komponen gaji.
- `src/data/mockEmployees.ts`: data contoh sementara.
- `src/services/employeeService.ts`: adapter pengambilan daftar karyawan; nanti diganti dengan pemanggilan API setelah kontrak T7 disepakati.
