import random
import math

# Fungsi untuk menghitung magic number untuk cube 5x5x5
def calculate_magic_number(n):
    return (n * (n**3 + 1)) // 2

# Fungsi untuk menghitung deviasi skor berdasarkan magic number
def calculate_score(cube, magic_number):
    n = len(cube)
    
    total_deviation = 0

    # 1. Hitung deviasi untuk semua baris
    for z in range(n):
        for y in range(n):
            row_sum = sum(cube[z][y][x] for x in range(n))
            total_deviation += abs(row_sum - magic_number)

    # 2. Hitung deviasi untuk semua kolom di setiap lapisan (XY plane)
    for z in range(n):
        for x in range(n):
            col_sum = sum(cube[z][y][x] for y in range(n))
            total_deviation += abs(col_sum - magic_number)

    # 3. Hitung deviasi untuk semua tiang (kumpulan elemen sepanjang dimensi Z)
    for y in range(n):
        for x in range(n):
            pillar_sum = sum(cube[z][y][x] for z in range(n))
            total_deviation += abs(pillar_sum - magic_number)

    # Hitung deviasi untuk semua diagonal sisi (pada setiap lapisan)
    for z in range(n):
        diag_sum_1 = sum(cube[z][i][i] for i in range(n))  # Diagonal utama pada XY plane
        diag_sum_2 = sum(cube[z][i][n-i-1] for i in range(n))  # Diagonal samping pada XY plane
        total_deviation += abs(diag_sum_1 - magic_number)
        total_deviation += abs(diag_sum_2 - magic_number)

    for y in range(n):
        diag_sum_1 = sum(cube[i][y][i] for i in range(n))  # Diagonal utama pada XZ plane
        diag_sum_2 = sum(cube[n-i-1][y][i] for i in range(n))  # Diagonal samping pada XZ plane
        total_deviation += abs(diag_sum_1 - magic_number)
        total_deviation += abs(diag_sum_2 - magic_number)

    for x in range(n):
        diag_sum_1 = sum(cube[i][i][x] for i in range(n))  # Diagonal utama pada YZ plane
        diag_sum_2 = sum(cube[i][n-i-1][x] for i in range(n))  # Diagonal samping pada YZ plane
        total_deviation += abs(diag_sum_1 - magic_number)
        total_deviation += abs(diag_sum_2 - magic_number)

    # 5. Hitung deviasi untuk semua diagonal di ruang (3D diagonal)
    diag_space_1 = sum(cube[i][i][i] for i in range(n))  # Diagonal utama di ruang
    diag_space_2 = sum(cube[i][i][n-i-1] for i in range(n))  # Diagonal ruang samping 1
    diag_space_3 = sum(cube[i][n-i-1][i] for i in range(n))  # Diagonal ruang samping 2
    diag_space_4 = sum(cube[n-i-1][i][i] for i in range(n))  # Diagonal ruang samping 3

    total_deviation += abs(diag_space_1 - magic_number)
    total_deviation += abs(diag_space_2 - magic_number)
    total_deviation += abs(diag_space_3 - magic_number)
    total_deviation += abs(diag_space_4 - magic_number)

    return total_deviation

# Fungsi untuk menukar dua angka secara acak di dalam cube
def swap_random_elements(cube):
    n = len(cube)
    x1, y1, z1 = random.randint(0, n-1), random.randint(0, n-1), random.randint(0, n-1)
    x2, y2, z2 = random.randint(0, n-1), random.randint(0, n-1), random.randint(0, n-1)
    cube[z1][y1][x1], cube[z2][y2][x2] = cube[z2][y2][x2], cube[z1][y1][x1]
    return (z1, y1, x1), (z2, y2, x2)

# Fungsi simulated annealing
def simulated_annealing(cube, initial_temp, cooling_rate):
    n = len(cube)
    magic_number = calculate_magic_number(n)
    
    current_temp = initial_temp
    current_solution = cube
    current_score = calculate_score(current_solution, magic_number)
    
    best_solution = current_solution
    best_score = current_score

    while current_temp > 0.0001:
        # Buat solusi tetangga dengan menukar dua elemen
        (z1, y1, x1), (z2, y2, x2) = swap_random_elements(current_solution)
        new_score = calculate_score(current_solution, magic_number)

        # Hitung perubahan skor
        delta_score = new_score - current_score

        # Jika solusi lebih baik atau diterima dengan probabilitas tertentu
        if delta_score < 0 or random.uniform(0, 1) < math.exp(-delta_score / current_temp):
            current_score = new_score
            if current_score < best_score:
                best_solution = [row[:] for row in current_solution]
                best_score = current_score
        else:
            # Batalkan perubahan jika tidak diterima
            current_solution[z1][y1][x1], current_solution[z2][y2][x2] = current_solution[z2][y2][x2], current_solution[z1][y1][x1]

        # Kurangi suhu
        current_temp *= cooling_rate

    return best_solution, best_score

def generate_random_cube(n):
        # Generate cube dengan angka 1 hingga n^3 secara acak
        numbers = list(range(1, n**3 + 1))
        random.shuffle(numbers)
        return [[[numbers.pop() for _ in range(n)] for _ in range(n)] for _ in range(n)]
    
# Contoh penggunaan
n = 5
# Inisialisasi magic cube secara acak dengan angka 1 sampai 125
cube = generate_random_cube(5)

# Konfigurasi parameter simulated annealing
initial_temp = 1000
cooling_rate = 0.999999


# Jalankan algoritma
best_solution, best_score = simulated_annealing(cube, initial_temp, cooling_rate)

print("Best solution found:")
print(best_solution)
print("Best score:", best_score)
