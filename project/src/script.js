import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for interactive rotation and zooming
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create a grid of cubes (5x5x5)
const cubes = [];
const gridSize = 5;
const cubeSize = 1;
const spacing = 2;

for (let x = 0; x < gridSize; x++) {
  cubes[x] = [];
  for (let y = 0; y < gridSize; y++) {
    cubes[x][y] = [];
    for (let z = 0; z < gridSize; z++) {
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#000000";
      context.font = "bold 120px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      const texture = new THREE.CanvasTexture(canvas);

      const material = new THREE.MeshStandardMaterial({ map: texture });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (x - (gridSize - 1) / 2) * spacing;
      cube.position.y = (y - (gridSize - 1) / 2) * spacing;
      cube.position.z = (z - (gridSize - 1) / 2) * spacing;
      scene.add(cube);
      cubes[x][y][z] = cube;
    }
  }
}

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

camera.position.set(0, 0, gridSize * spacing);
camera.lookAt(0, 0, 0);

function generateRandomData() {
  const data = [];
  const totalCubes = gridSize * gridSize * gridSize;

  // Create an array with numbers from 1 to totalCubes (1 to 125)
  const numbers = [];
  for (let i = 1; i <= totalCubes; i++) {
    numbers.push(i);
  }

  let currentIndex = numbers.length;

  console.log(numbers);

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [numbers[currentIndex], numbers[randomIndex]] = [
      numbers[randomIndex],
      numbers[currentIndex],
    ];
  }

  // Fill the data array with shuffled numbers
  let index = 0;
  for (let x = 0; x < gridSize; x++) {
    data[x] = [];
    for (let y = 0; y < gridSize; y++) {
      data[x][y] = [];
      for (let z = 0; z < gridSize; z++) {
        data[x][y][z] = numbers[index];
        index++;
      }
    }
  }

  return data;
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

// Data variables
let cubeDataSets = [];
let moveDataSets = [];
let currentDataIndex = -1;

// Function to update cubes with data at currentDataIndex
function updateCubes() {
  if (currentDataIndex >= 0 && currentDataIndex < cubeDataSets.length) {
    const cubeData = cubeDataSets[currentDataIndex];
    const moveData = moveDataSets?.[currentDataIndex - 1] ?? [-1, -1, -1];

    console.log(cubeData);
    console.log(cubeDataSets[currentDataIndex - 1]);

    // Update cubes based on data
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const value = cubeData[x][y][z];
          const cube = cubes[x][y][z];

          // Create canvas for number texture
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 256;
          const context = canvas.getContext("2d");

          if (arraysEqual([x, y, z], moveData?.[0] ?? [-1, -1, -1])) {
            context.fillStyle = "#eb4034"; // Background color
          } else if (arraysEqual([x, y, z], moveData?.[1] ?? [-1, -1, -1])) {
            context.fillStyle = "#eb4034"; // Background color
          } else {
            context.fillStyle = "#ffffff"; // Background color
          }
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "#000000"; // Text color
          context.font = "bold 120px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            value.toString(),
            canvas.width / 2,
            canvas.height / 2
          );

          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;

          if (Array.isArray(cube.material)) {
            cube.material[4].map = texture;
            cube.material[4].needsUpdate = true;
          } else {
            cube.material.map = texture;
            cube.material.needsUpdate = true;
          }
        }
      }
    }
  }
}

function nextRight() {
  if (currentDataIndex >= cubeDataSets.length - 1) {
    alert("No next data available.");
  }
  currentDataIndex++;
  updateCubes();
}

function nextLeft() {
  if (currentDataIndex > 0) {
    currentDataIndex--;
    console.log(moveDataSets[currentDataIndex]);
    updateCubes();
  } else {
    alert("No previous data available.");
  }
}
function reset() {
  cubeDataSets = [];
  currentDataIndex = -1;
  nextRight();
}

document.getElementById("nextButton").addEventListener("click", nextRight);
document.getElementById("prevButton").addEventListener("click", nextLeft);
document.getElementById("resetButton").addEventListener("click", reset);

nextRight();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

function calculateMagicNumber(n) {
  return (n * (Math.pow(n, 3) + 1)) / 2;
}

// FUNCTION FOR ALGORITHM PURPOSE
function calculateScore(cube, magicNumber) {
  const n = cube.length;

  let totalDeviation = 0;

  // 1. BAGIAN X
  for (let z = 0; z < n; z++) {
    for (let y = 0; y < n; y++) {
      let rowSum = 0;
      for (let x = 0; x < n; x++) {
        rowSum += cube[z][y][x];
      }
      totalDeviation += Math.abs(rowSum - magicNumber);
    }
  }

  // 2. BAGIAN Y
  for (let z = 0; z < n; z++) {
    for (let x = 0; x < n; x++) {
      let colSum = 0;
      for (let y = 0; y < n; y++) {
        colSum += cube[z][y][x];
      }
      totalDeviation += Math.abs(colSum - magicNumber);
    }
  }

  // 3. BAGIAN Z
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let pillarSum = 0;
      for (let z = 0; z < n; z++) {
        pillarSum += cube[z][y][x];
      }
      totalDeviation += Math.abs(pillarSum - magicNumber);
    }
  }

  // 4. DIAGONAL
  // a) XY
  for (let z = 0; z < n; z++) {
    let diagSum1 = 0;
    let diagSum2 = 0;
    for (let i = 0; i < n; i++) {
      diagSum1 += cube[z][i][i];
      diagSum2 += cube[z][i][n - i - 1];
    }
    totalDeviation += Math.abs(diagSum1 - magicNumber);
    totalDeviation += Math.abs(diagSum2 - magicNumber);
  }

  // b) XZ
  for (let y = 0; y < n; y++) {
    let diagSum1 = 0;
    let diagSum2 = 0;
    for (let i = 0; i < n; i++) {
      diagSum1 += cube[i][y][i];
      diagSum2 += cube[n - i - 1][y][i];
    }
    totalDeviation += Math.abs(diagSum1 - magicNumber);
    totalDeviation += Math.abs(diagSum2 - magicNumber);
  }

  // c) YZ
  for (let x = 0; x < n; x++) {
    let diagSum1 = 0;
    let diagSum2 = 0;
    for (let i = 0; i < n; i++) {
      diagSum1 += cube[i][i][x];
      diagSum2 += cube[i][n - i - 1][x];
    }
    totalDeviation += Math.abs(diagSum1 - magicNumber);
    totalDeviation += Math.abs(diagSum2 - magicNumber);
  }

  // 5. XYZ DIAGONAL
  let diagSpace1 = 0;
  let diagSpace2 = 0;
  let diagSpace3 = 0;
  let diagSpace4 = 0;
  for (let i = 0; i < n; i++) {
    diagSpace1 += cube[i][i][i];
    diagSpace2 += cube[i][i][n - i - 1];
    diagSpace3 += cube[i][n - i - 1][i];
    diagSpace4 += cube[n - i - 1][i][i];
  }
  totalDeviation += Math.abs(diagSpace1 - magicNumber);
  totalDeviation += Math.abs(diagSpace2 - magicNumber);
  totalDeviation += Math.abs(diagSpace3 - magicNumber);
  totalDeviation += Math.abs(diagSpace4 - magicNumber);

  return totalDeviation;
}

// simulated annealing
let initialTemp = 1000;
let coolingRate = 0.999;
function swapRandomElements(cube) {
  const n = cube.length;

  // Generate random coordinates for two elements
  const x1 = Math.floor(Math.random() * n);
  const y1 = Math.floor(Math.random() * n);
  const z1 = Math.floor(Math.random() * n);
  const x2 = Math.floor(Math.random() * n);
  const y2 = Math.floor(Math.random() * n);
  const z2 = Math.floor(Math.random() * n);

  // Swap the elements
  const temp = cube[z1][y1][x1];
  cube[z1][y1][x1] = cube[z2][y2][x2];
  cube[z2][y2][x2] = temp;

  return [
    [z1, y1, x1],
    [z2, y2, x2],
  ];
}

let paused = false;
let canceled = false;

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const cancelBtn = document.getElementById("cancelBtn");

pauseBtn.addEventListener("click", () => (paused = true));
resumeBtn.addEventListener("click", () => (paused = false));
cancelBtn.addEventListener("click", () => (canceled = true));

async function simulatedAnnealing() {
  let cube = generateRandomData();

  paused = false;
  canceled = false;

  //   clear data
  cubeDataSets = [];
  moveDataSets = [];
  currentDataIndex = -1;

  cubeDataSets.push(cube);
  currentDataIndex++;
  updateCubes();

  const n = cube.length;
  const magicNumber = calculateMagicNumber(n);

  let currentTemp = initialTemp;
  let currentSolution = cube;
  let currentScore = calculateScore(currentSolution, magicNumber);

  let bestSolution = currentSolution;
  let bestScore = currentScore;

  while (currentTemp > 0.0001) {
    if (canceled) {
      console.log("Simulation canceled.");
      break;
    }

    while (paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(currentTemp);

    // Swap
    const [[z1, y1, x1], [z2, y2, x2]] = swapRandomElements(currentSolution);
    const newScore = calculateScore(currentSolution, magicNumber);

    const deltaScore = newScore - currentScore;

    if (deltaScore < 0 || Math.random() < Math.exp(-deltaScore / currentTemp)) {
      currentScore = newScore;
      if (currentScore < bestScore) {
        bestSolution = JSON.parse(JSON.stringify(currentSolution)); // Deep copy
        bestScore = currentScore;

        // Add deep copy to dataset
        cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
        moveDataSets.push([
          [z1, y1, x1],
          [z2, y2, x2],
        ]);
        currentDataIndex = cubeDataSets.length() - 1;

        updateCubes();

        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log("5-second delay complete.");
      }
    } else {
      const temp = currentSolution[z1][y1][x1];
      currentSolution[z1][y1][x1] = currentSolution[z2][y2][x2];
      currentSolution[z2][y2][x2] = temp;
    }

    // Decrease the temperature
    currentTemp *= coolingRate;
  }

  console.log(bestSolution, bestScore);

  updateCubes();

  return { bestSolution, bestScore };
}

document
  .getElementById("simulatedAnnealingButton")
  .addEventListener("click", simulatedAnnealing);

// Hill Climb
