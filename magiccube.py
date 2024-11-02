import math
import random
import time

class DiagonalMagicCube:
    def __init__(self, n):
        self.n = n  # Dimensi kubus (misal 5x5x5)
        self.magic_number = n * (n**3 + 1) // 2  # Rumus magic number
        self.cube = self.generate_random_cube()  # Inisialisasi cube secara acak
    
    def generate_random_cube(self):
        """Generate cube dengan angka 1 hingga n^3 secara acak"""
        numbers = list(range(1, self.n**3 + 1))
        random.shuffle(numbers)
        return [[[numbers.pop() for _ in range(self.n)] for _ in range(self.n)] for _ in range(self.n)]
    
    def calculate_objective_function(self):
        """Calculate the total deviation from the magic number"""
        total_deviation = 0

        # 1. Deviation for all rows
        for z in range(self.n):
            for y in range(self.n):
                row_sum = sum(self.cube[z][y][x] for x in range(self.n))
                total_deviation += abs(row_sum - self.magic_number)

        # 2. Deviation for all columns in each layer (XY plane)
        for z in range(self.n):
            for x in range(self.n):
                col_sum = sum(self.cube[z][y][x] for y in range(self.n))
                total_deviation += abs(col_sum - self.magic_number)

        # 3. Deviation for all pillars (elements along Z dimension)
        for y in range(self.n):
            for x in range(self.n):
                pillar_sum = sum(self.cube[z][y][x] for z in range(self.n))
                total_deviation += abs(pillar_sum - self.magic_number)

        # 4. Deviation for all diagonals in each layer
        for z in range(self.n):
            diag_sum_1 = sum(self.cube[z][i][i] for i in range(self.n))  # Main diagonal in XY plane
            diag_sum_2 = sum(self.cube[z][i][self.n-i-1] for i in range(self.n))  # Secondary diagonal in XY plane
            total_deviation += abs(diag_sum_1 - self.magic_number)
            total_deviation += abs(diag_sum_2 - self.magic_number)

        for y in range(self.n):
            diag_sum_1 = sum(self.cube[i][y][i] for i in range(self.n))  # Main diagonal in XZ plane
            diag_sum_2 = sum(self.cube[self.n-i-1][y][i] for i in range(self.n))  # Secondary diagonal in XZ plane
            total_deviation += abs(diag_sum_1 - self.magic_number)
            total_deviation += abs(diag_sum_2 - self.magic_number)

        for x in range(self.n):
            diag_sum_1 = sum(self.cube[i][i][x] for i in range(self.n))  # Main diagonal in YZ plane
            diag_sum_2 = sum(self.cube[i][self.n-i-1][x] for i in range(self.n))  # Secondary diagonal in YZ plane
            total_deviation += abs(diag_sum_1 - self.magic_number)
            total_deviation += abs(diag_sum_2 - self.magic_number)

        # 5. Deviation for all space diagonals (3D diagonal)
        diag_space_1 = sum(self.cube[i][i][i] for i in range(self.n))  # Main space diagonal
        diag_space_2 = sum(self.cube[i][i][self.n-i-1] for i in range(self.n))  # Space diagonal 1
        diag_space_3 = sum(self.cube[i][self.n-i-1][i] for i in range(self.n))  # Space diagonal 2
        diag_space_4 = sum(self.cube[self.n-i-1][i][i] for i in range(self.n))  # Space diagonal 3

        total_deviation += abs(diag_space_1 - self.magic_number)
        total_deviation += abs(diag_space_2 - self.magic_number)
        total_deviation += abs(diag_space_3 - self.magic_number)
        total_deviation += abs(diag_space_4 - self.magic_number)

        return total_deviation

    def swap_positions(self, pos1, pos2):
        """Tukar dua posisi angka di dalam kubus"""
        x1, y1, z1 = pos1
        x2, y2, z2 = pos2
        self.cube[x1][y1][z1], self.cube[x2][y2][z2] = self.cube[x2][y2][z2], self.cube[x1][y1][z1]

class HillClimbing:
    def __init__(self, cube: DiagonalMagicCube):
        self.cube = cube
    
    def find_best_neighbor(self):
        """Cari solusi tetangga terbaik dengan mengecek seluruh kemungkinan pertukaran."""
        current_value = self.cube.calculate_objective_function()
        best_value = current_value
        best_neighbor = None

        # Cek seluruh kemungkinan pasangan posisi di dalam kubus
        for i1 in range(self.cube.n):
            for j1 in range(self.cube.n):
                for k1 in range(self.cube.n):
                    for i2 in range(self.cube.n):
                        for j2 in range(self.cube.n):
                            for k2 in range(self.cube.n):
                                # Abaikan jika posisi yang dipilih sama
                                if (i1, j1, k1) == (i2, j2, k2):
                                    continue
                                
                                # Tukar posisi dua angka
                                self.cube.swap_positions((i1, j1, k1), (i2, j2, k2))
                                
                                # Hitung objective function setelah pertukaran
                                new_value = self.cube.calculate_objective_function()
                                
                                # Jika ada perbaikan, catat tetangga terbaik
                                if new_value <= best_value:
                                    best_value = new_value
                                    best_neighbor = ((i1, j1, k1), (i2, j2, k2))
                                
                                # Kembalikan posisi awal
                                self.cube.swap_positions((i1, j1, k1), (i2, j2, k2))

        # Jika tetangga terbaik ditemukan, lakukan pertukaran
        if best_neighbor:
            pos1, pos2 = best_neighbor
            self.cube.swap_positions(pos1, pos2)
        
        return best_value

    def perform_search(self):
        """Lakukan pencarian Hill-Climbing sampai mencapai solusi lokal terbaik."""
        current_value = self.cube.calculate_objective_function()
        while True:
            best_value = self.find_best_neighbor()
            
            # Jika tidak ada perbaikan lagi, hentikan pencarian
            if best_value >= current_value:
                break
            
            current_value = best_value
        
        return current_value


class SimulatedAnnealing:
    def __init__(self, cube:DiagonalMagicCube, initial_temp=10000, cooling_rate=0.99999):
        self.cube = cube
        self.temperature = initial_temp
        self.cooling_rate = cooling_rate
    
    def acceptance_probability(self, old_value, new_value):
        """Menghitung probabilitas menerima solusi yang lebih buruk"""
        if new_value < old_value:
            return 1.0
        return math.exp((old_value - new_value) / self.temperature)
    
    def cool_down(self):
        """Menurunkan suhu"""
        self.temperature *= self.cooling_rate
    
    def perform_search(self):
        """Melakukan pencarian menggunakan Simulated Annealing"""
        current_value = self.cube.calculate_objective_function()
        
        while self.temperature > 0.001 : #mendekati 0
            pos1 = (random.randint(0, self.cube.n-1), random.randint(0, self.cube.n-1), random.randint(0, self.cube.n-1))
            pos2 = (random.randint(0, self.cube.n-1), random.randint(0, self.cube.n-1), random.randint(0, self.cube.n-1))
            
            self.cube.swap_positions(pos1, pos2)
            new_value = self.cube.calculate_objective_function()
            
            if self.acceptance_probability(current_value, new_value) > random.random():
                current_value = new_value
            else:
                self.cube.swap_positions(pos1, pos2)  # Swap kembali ke keadaan awal
            
            self.cool_down()
        
        return current_value

def RandomRestart(n):
    best_val = math.inf
    for i in range(n):
        cube = DiagonalMagicCube(5)
        hc = HillClimbing(cube)
        res = hc.perform_search()
        if res < best_val:
            best_val = res
    return best_val

print(RandomRestart(1))
# start = time.time()
# Contoh Penggunaan
# n = 5  # Dimensi kubus
# cube = DiagonalMagicCube(n)

# hc = HillClimbing(cube)
# sa = SimulatedAnnealing(cube)
# # Pencarian menggunakan Hill Climbing
# result_hc = hc.perform_search()
# print("Objective value setelah Hill Climbing:", result_hc)
# print(time.time() - start)
# Pencarian menggunakan Simulated Annealing
# result_sa = sa.perform_search()
# print("Objective value setelah Simulated Annealing:", result_sa)
# print(time.time() - start)