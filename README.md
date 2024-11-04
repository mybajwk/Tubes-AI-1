<h1 align="center">Tugas Besar 1 IF3170 Inteligensi Artifisial</h1>
<h1 align="center">Pencarian Solusi Diagonal Magic Cube dengan Local Search</h1>

## Deskripsi Program

Project ini berisi implementasi algoritma local search untuk menyelesaikan permasalahan Diagonal Magic Cube berukuran 5x5x5. Proyek ini mencakup implementasi beberapa algoritma local search, termasuk Steepest Ascent Hill-Climbing, Hill-Climbing with Sideways Move, Random Restart Hill-Climbing, Simulated Annealing, dan Genetic Algorithm. Setiap algoritma bertujuan untuk menemukan konfigurasi elemen dalam kubus 3D yang memenuhi kriteria magic number tertentu.

## Teknologi yang Digunakan

- Three.js
- Node.js

## Instalasi dan Set Up

1. Clone repository ini:

   ```
   git clone https://github.com/mybajwk/Tubes-AI-1.git
   cd ./Tubes-AI-1/src
   ```

2. Instal dependensi: Pastikan Anda telah menginstal Node.js. Lalu jalankan perintah berikut:

   ```
   npm install
   ```

3. Jalankan program: Untuk menjalankan aplikasi, gunakan:

   ```
    node server.js
   ```

4. Akses visualisasi: Buka browser dan kunjungi http://localhost:3000 untuk melihat visualisasi dan menjalankan algoritma local search.

## Cara Menjalankan Program

- Setelah server berjalan, Anda dapat mengakses antarmuka pengguna di browser untuk memilih dan menjalankan berbagai algoritma pencarian.
- Algoritma dapat dikonfigurasi dengan parameter seperti jumlah iterasi, jumlah populasi (untuk genetic algorithm), dan batas gerakan sideways (untuk hill-climbing with sideways move).
- Program ini akan menampilkan visualisasi state awal dan state akhir kubus, serta mencatat hasil eksperimen termasuk nilai objective function dan durasi proses pencarian.

## Pembagian Tugas

### **Kelompok 20**

|   NIM    |        Nama         | Deskripsi Tugas                                                                                          |
| :------: | :-----------------: | -------------------------------------------------------------------------------------------------------- |
| 13522073 | Juan Alfred Widjaya | Membuat Form, Membuat Plot, Membuat Animasi, Implementasi HillClimb Random Restart, Fix bug, Laporan     |
| 13522077 |   Enrique Yanuar    | Membuat tampilan 3D, Implementasi HillClimb Steepest, Implementasi Simulated Annealing, Fix bug, Laporan |
| 13522081 |       Albert        | Membuat Form parameter, Membuat animasi, Implementasi,HillClimb Stochastic, Fix bug, Laporan             |
| 13522115 |   Derwin Rustanly   | Implementasi Genetic Algorithm, Implementasi HillClimb Sideways, Laporan, Fix bug                        |

## Bonus

- Implementasi seluruh algoritma hill-climbing
- ‘video player'
