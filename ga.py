import random
import copy

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

    # 4. Hitung deviasi untuk semua diagonal sisi (pada setiap lapisan)
    for z in range(n):
        diag_sum_1 = sum(cube[z][i][i] for i in range(n))  # Diagonal utama pada XY plane
        diag_sum_2 = sum(cube[z][i][n-i-1] for i in range(n))  # Diagonal samping pada XY plane
        total_deviation += abs(diag_sum_1 - magic_number)
        total_deviation += abs(diag_sum_2 - magic_number)

    # 5. Hitung deviasi untuk semua diagonal pada XZ plane
    for y in range(n):
        diag_sum_1 = sum(cube[i][y][i] for i in range(n))  # Diagonal utama pada XZ plane
        diag_sum_2 = sum(cube[n-1-i][y][i] for i in range(n))  # Diagonal samping pada XZ plane
        total_deviation += abs(diag_sum_1 - magic_number)
        total_deviation += abs(diag_sum_2 - magic_number)

    # 6. Hitung deviasi untuk semua diagonal pada YZ plane
    for x in range(n):
        diag_sum_1 = sum(cube[i][i][x] for i in range(n))  # Diagonal utama pada YZ plane
        diag_sum_2 = sum(cube[i][n-1-i][x] for i in range(n))  # Diagonal samping pada YZ plane
        total_deviation += abs(diag_sum_1 - magic_number)
        total_deviation += abs(diag_sum_2 - magic_number)

    # 7. Hitung deviasi untuk semua diagonal di ruang (3D diagonal)
    diag_space_1 = sum(cube[i][i][i] for i in range(n))  # Diagonal utama di ruang
    diag_space_2 = sum(cube[i][i][n-1-i] for i in range(n))  # Diagonal ruang samping 1
    diag_space_3 = sum(cube[i][n-1-i][i] for i in range(n))  # Diagonal ruang samping 2
    diag_space_4 = sum(cube[n-1-i][i][i] for i in range(n))  # Diagonal ruang samping 3

    total_deviation += abs(diag_space_1 - magic_number)
    total_deviation += abs(diag_space_2 - magic_number)
    total_deviation += abs(diag_space_3 - magic_number)
    total_deviation += abs(diag_space_4 - magic_number)

    return total_deviation

# Fungsi untuk menghitung fitness dari sebuah state cube
def fitness(cube, magic_number):
    score = calculate_score(cube, magic_number)
    return 1 / (1 + score)  # Semakin kecil deviasi, semakin besar fitness

# Fungsi untuk membuat random cube 3D
def create_random_cube(n):
    elements = list(range(1, n**3 + 1))
    random.shuffle(elements)
    cube = [[[0]*n for _ in range(n)] for _ in range(n)]
    idx = 0
    for z in range(n):
        for y in range(n):
            for x in range(n):
                cube[z][y][x] = elements[idx]
                idx += 1
    return cube

# Fungsi crossover antara dua parent
def crossover(parent1, parent2, n):
    # Single-point crossover pada level lapisan (z)
    crossover_point = random.randint(1, n - 1)
    child1 = copy.deepcopy(parent1)
    child2 = copy.deepcopy(parent2)
    for z in range(crossover_point, n):
        child1[z], child2[z] = child2[z], child1[z]
    return child1, child2

# Fungsi mutasi
def mutate(cube, mutation_rate):
    n = len(cube)
    total_elements = n ** 3

    # Flatten the cube to 1D list for easier manipulation
    flat_cube = [cube[z][y][x] for z in range(n) for y in range(n) for x in range(n)]

    if random.random() < mutation_rate:
        # Randomly select two different indices to swap their values
        i, j = random.sample(range(total_elements), 2)
        flat_cube[i], flat_cube[j] = flat_cube[j], flat_cube[i]

    # Cek dan perbaiki duplikasi
    unique_elements = set(flat_cube)
    missing_elements = set(range(1, total_elements + 1)) - unique_elements

    if len(unique_elements) != total_elements:
        # Cari elemen yang duplikat
        seen = set()
        duplicate_indices = []
        for index, item in enumerate(flat_cube):
            if item in seen:
                duplicate_indices.append(index)
            else:
                seen.add(item)

        # Ganti elemen duplikat dengan elemen yang hilang
        for idx in duplicate_indices:
            if missing_elements:
                flat_cube[idx] = missing_elements.pop()  # Ganti dengan angka yang belum digunakan

    # Convert back to 3D cube
    idx = 0
    for z in range(n):
        for y in range(n):
            for x in range(n):
                cube[z][y][x] = flat_cube[idx]
                idx += 1

    return cube

# Fungsi untuk memilih parent menggunakan roulette wheel selection
def select_parents(population, fitnesses):
    total_fitness = sum(fitnesses)
    selection_probs = [f / total_fitness for f in fitnesses]
    parent1 = population[random.choices(range(len(population)), weights=selection_probs)[0]]
    parent2 = population[random.choices(range(len(population)), weights=selection_probs)[0]]
    return parent1, parent2

# Genetic Algorithm untuk Diagonal Magic Cube
def genetic_algorithm(n, population_size=50, generations=1000, mutation_rate=0.05):
    magic_number = calculate_magic_number(n)
    # Inisialisasi populasi
    population = [create_random_cube(n) for _ in range(population_size)]

    best_solution = None
    best_score = float('inf')

    for generation in range(generations):
        fitnesses = [fitness(individual, magic_number) for individual in population]
        # Cek solusi terbaik
        for i, individual in enumerate(population):
            score = calculate_score(individual, magic_number)
            if score < best_score:
                best_score = score
                best_solution = copy.deepcopy(individual)
                # print(f"Generasi {generation}, Solusi terbaik dengan deviasi {best_score}")
                if best_score == 0:
                    return best_solution

        new_population = []
        while len(new_population) < population_size:
            # Seleksi parent
            parent1, parent2 = select_parents(population, fitnesses)
            # Crossover
            child1, child2 = crossover(parent1, parent2, n)
            # Mutasi
            mutate(child1, mutation_rate)
            mutate(child2, mutation_rate)
            new_population.extend([child1, child2])

        population = new_population[:population_size]  # Pastikan ukuran populasi tetap

    return best_solution

# Parameter
n = 5  # Ukuran kubus 5x5x5
population_size = 100
generations = 10000  # Meningkatkan jumlah generasi untuk peluang lebih besar menemukan solusi
mutation_rate = 0.5  # Meningkatkan laju mutasi

# Jalankan Genetic Algorithm
best_solution = genetic_algorithm(n, population_size, generations, mutation_rate)

if best_solution:
    print("Solusi terbaik ditemukan:")
    print(calculate_score(best_solution, 315))
else:
    print("Tidak menemukan solusi optimal.")
