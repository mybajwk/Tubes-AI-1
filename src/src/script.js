import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Set up scene, camera, renderer
const scene = new THREE.Scene();
const sceneContainer = document.getElementById("sceneContainer");
const camera = new THREE.PerspectiveCamera(
  75,
  sceneContainer.clientWidth / sceneContainer.clientHeight,
  0.1,
  1000
);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);
console.log("Initial camera position:", camera.position);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
sceneContainer.appendChild(renderer.domElement);

// Add OrbitControls for interactive rotation and zooming
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.update();

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

const delayTime = 100;

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
let maxSideways = 50;

function animateCubeMovement(cube, targetPosition, duration = delayTime) {
  // Start and end positions for the animation
  const startPosition = cube.position.clone();
  const midPosition = startPosition.clone().lerp(targetPosition.clone(), 0.5);

  const startTime = Date.now();

  function animate() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    if (progress <= 0.5) {
      cube.position.lerpVectors(startPosition, midPosition, progress * 2);
    } else {
      cube.position.lerpVectors(
        midPosition,
        startPosition,
        (progress - 0.5) * 2
      );
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function updateCubes() {
  if (currentDataIndex >= 0 && currentDataIndex < cubeDataSets.length) {
    const cubeData = cubeDataSets[currentDataIndex];
    const moveData = moveDataSets?.[currentDataIndex - 1] ?? [-1, -1, -1];

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
            const targetCube =
              cubes[moveData[1][0]][moveData[1][1]][moveData[1][2]];
            animateCubeMovement(cube, targetCube.position);
          } else if (arraysEqual([x, y, z], moveData?.[1] ?? [-1, -1, -1])) {
            context.fillStyle = "#eb4034"; // Background color
            const targetCube =
              cubes[moveData[0][0]][moveData[0][1]][moveData[0][2]];
            animateCubeMovement(cube, targetCube.position);
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
    // alert("No next data available.");
    return;
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

function swapRandomElements(cube) {
  const n = cube.length;
  let x1, y1, z1, x2, y2, z2;

  do {
    x1 = Math.floor(Math.random() * n);
    y1 = Math.floor(Math.random() * n);
    z1 = Math.floor(Math.random() * n);
    x2 = Math.floor(Math.random() * n);
    y2 = Math.floor(Math.random() * n);
    z2 = Math.floor(Math.random() * n);
  } while (x1 === x2 && y1 === y2 && z1 === z2);

  // Swap the elements
  const temp = cube[z1][y1][x1];
  cube[z1][y1][x1] = cube[z2][y2][x2];
  cube[z2][y2][x2] = temp;

  return [
    [z1, y1, x1],
    [z2, y2, x2],
  ];
}

function swapElement(cube, x1, y1, z1, x2, y2, z2) {
  // Swap the elements
  const temp = cube[z1][y1][x1];
  cube[z1][y1][x1] = cube[z2][y2][x2];
  cube[z2][y2][x2] = temp;
}

let paused = false;
let canceled = false;

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const cancelBtn = document.getElementById("cancelBtn");

pauseBtn.addEventListener("click", () => (paused = true));
resumeBtn.addEventListener("click", () => (paused = false));
cancelBtn.addEventListener("click", () => (canceled = true));

let initialTemp = 100;
let coolingRate = 0.9999;

async function simulatedAnnealing() {
  let cube = generateRandomData();

  paused = false;
  canceled = false;

  // Clear data
  cubeDataSets = [];
  moveDataSets = [];
  currentDataIndex = -1;

  cubeDataSets.push(cube);
  currentDataIndex++;
  updateCubes();

  const n = cube.length;
  const magicNumber = calculateMagicNumber(n);

  let currentTemp = initialTemp;
  let currentSolution = JSON.parse(JSON.stringify(cube));
  let currentScore = calculateScore(currentSolution, magicNumber);

  let bestSolution = JSON.parse(JSON.stringify(currentSolution)); // Deep copy
  let bestScore = currentScore;

  let etArray = [];
  let scoresArray = [];

  while (currentTemp > 0.0001) {
    if (canceled) {
      console.log("Simulation canceled.");
      break;
    }

    while (paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Create a temporary copy of the current solution
    let tempSolution = JSON.parse(JSON.stringify(currentSolution));
    const [[z1, y1, x1], [z2, y2, x2]] = swapRandomElements(tempSolution);
    const newScore = calculateScore(tempSolution, magicNumber);

    scoresArray.push(currentScore);

    const deltaScore = newScore - currentScore;

    // Calculate ET (exponential acceptance probability)
    let et = Math.exp(-deltaScore / currentTemp);
    if (et > 1) {
      et = 1;
    }
    etArray.push(et);

    if (deltaScore < 0 || Math.random() < et) {
      let tempScore = newScore;
      if (tempScore < bestScore) {
        currentScore = tempScore;
        currentSolution = JSON.parse(JSON.stringify(tempSolution)); // Accept the new solution
        bestSolution = JSON.parse(JSON.stringify(currentSolution)); // Deep copy
        bestScore = currentScore;

        // Add deep copy to dataset
        cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
        moveDataSets.push([
          [z1, y1, x1],
          [z2, y2, x2],
        ]);

        updateCubes();
        currentDataIndex = cubeDataSets.length - 1;

        await new Promise((resolve) => setTimeout(resolve, delayTime));
      }
    }
    // Decrease the temperature
    currentTemp *= coolingRate;
  }

  console.log(bestSolution, bestScore);

  updateCubes();

  return {
    bestSolution: bestSolution,
    bestScore: bestScore,
    et: etArray,
    scores: scoresArray,
  };
}

function findBestNeighbor(cube) {
  const n = cube.length;
  const magicNumber = calculateMagicNumber(n);
  let currentValue = calculateScore(cube, magicNumber);
  let bestValue = currentValue;
  let bestNeighbor = null;

  // Check all possible pairs of positions in the cube
  for (let i1 = 0; i1 < gridSize; i1++) {
    for (let j1 = 0; j1 < gridSize; j1++) {
      for (let k1 = 0; k1 < gridSize; k1++) {
        for (let i2 = 0; i2 < gridSize; i2++) {
          for (let j2 = 0; j2 < gridSize; j2++) {
            for (let k2 = 0; k2 < gridSize; k2++) {
              // Skip if the positions are the same
              if (i1 === i2 && j1 === j2 && k1 === k2) {
                continue;
              }

              // Swap the two positions
              swapElement(cube, i1, j1, k1, i2, j2, k2);

              // Calculate objective function after swap
              let newValue = calculateScore(cube, magicNumber);

              // Record the best neighbor if an improvement is found
              if (newValue <= bestValue) {
                bestValue = newValue;
                bestNeighbor = [
                  [k1, j1, i1],
                  [k2, j2, i2],
                ];
              }
              swapElement(cube, i2, j2, k2, i1, j1, k1);
            }
          }
        }
      }
    }
  }

  return { bestNeighbor, bestValue };
}

async function hillClimbSteepest() {
  let cube = generateRandomData();

  paused = false;
  canceled = false;

  // Clear data
  cubeDataSets = [];
  moveDataSets = [];
  let scores = [];
  currentDataIndex = -1;

  cubeDataSets.push(cube);
  currentDataIndex++;
  updateCubes();

  const n = cube.length;
  const magicNumber = calculateMagicNumber(n);

  let currentSolution = cube;
  let currentScore = calculateScore(currentSolution, magicNumber);

  let bestSolution = currentSolution;
  let bestScore = currentScore;

  while (true) {
    if (canceled) {
      console.log("Simulation canceled.");
      break;
    }

    while (paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    let { bestNeighbor, bestValue: newScore } =
      findBestNeighbor(currentSolution);

    if (bestNeighbor) {
      const [[z1, y1, x1], [z2, y2, x2]] = bestNeighbor;
      if (newScore >= currentScore) {
        break;
      }

      swapElement(currentSolution, x1, y1, z1, x2, y2, z2);

      // Next step
      currentScore = newScore;
      bestSolution = JSON.parse(JSON.stringify(currentSolution)); // Deep copy
      bestScore = currentScore;
      scores.push(bestScore);

      // Add deep copy to dataset
      cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
      moveDataSets.push([
        [z1, y1, x1],
        [z2, y2, x2],
      ]);
      currentDataIndex = cubeDataSets.length - 1;
      console.log(bestScore);

      updateCubes();

      await new Promise((resolve) => setTimeout(resolve, delayTime));
      console.log("5-second delay complete.");
    } else {
      break;
    }
  }

  updateCubes();

  return { solution: bestSolution, bestScore: bestScore, scores: scores };
}

async function hillClimbStochastic() {
  let cube = generateRandomData();

  paused = false;
  canceled = false;

  // Clear data
  cubeDataSets = [];
  moveDataSets = [];
  let scores = [];
  let iterations = 0;
  currentDataIndex = -1;

  cubeDataSets.push(cube);
  currentDataIndex++;
  updateCubes();

  const n = cube.length;
  const magicNumber = calculateMagicNumber(n);

  let currentSolution = cube;
  let currentScore = calculateScore(currentSolution, magicNumber);

  let bestSolution = currentSolution;
  let bestScore = currentScore;

  const maxIterations = 200;

  while (iterations < maxIterations) {
    if (canceled) {
      console.log("Simulation canceled.");
      break;
    }

    while (paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Increment iteration count
    iterations++;

    // Randomly swap two elements and evaluate new score
    const [[z1, y1, x1], [z2, y2, x2]] = swapRandomElements(currentSolution);
    const newScore = calculateScore(currentSolution, magicNumber);
    scores.push(newScore);

    // If the new solution is worse or equal, revert the swap
    if (newScore >= currentScore) {
      swapElement(currentSolution, x2, y2, z2, x1, y1, z1);
    } else {
      // Accept the new solution
      currentScore = newScore;
      bestSolution = JSON.parse(JSON.stringify(currentSolution)); // Deep copy
      bestScore = currentScore;

      // Add deep copy to dataset
      cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
      moveDataSets.push([
        [z1, y1, x1],
        [z2, y2, x2],
      ]);
      currentDataIndex = cubeDataSets.length - 1;
      console.log(`Iteration ${iterations}: Best Score = ${bestScore}`);

      updateCubes();

      await new Promise((resolve) => setTimeout(resolve, delayTime));
    }
  }

  updateCubes();

  return { solution: bestSolution, bestScore: bestScore, scores: scores };
}

async function hillClimbSideways() {
  let cube = generateRandomData();

  paused = false;
  canceled = false;

  // Clear data
  cubeDataSets = [];
  moveDataSets = [];
  let scores = [];
  currentDataIndex = -1;

  cubeDataSets.push(cube);
  currentDataIndex++;
  updateCubes();

  const n = cube.length;
  const magicNumber = calculateMagicNumber(n);

  let currentSolution = cube;
  let currentScore = calculateScore(currentSolution, magicNumber);

  let bestSolution = currentSolution;
  let bestScore = currentScore;

  let sidewaysCount = 0;
  console.log(maxSideways);
  while (sidewaysCount < maxSideways) {
    if (canceled) {
      console.log("Simulation canceled.");
      break;
    }

    while (paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    let { bestNeighbor, bestValue: newScore } =
      findBestNeighbor(currentSolution);

    if (bestNeighbor) {
      const [[z1, y1, x1], [z2, y2, x2]] = bestNeighbor;
      if (newScore === currentScore) {
        sidewaysCount++;
        console.log(sidewaysCount);
      } else if (newScore < currentScore) {
        currentScore = newScore;
        sidewaysCount = 0;
      } else {
        break;
      }

      swapElement(currentSolution, x1, y1, z1, x2, y2, z2);

      // Next step
      currentScore = newScore;
      bestSolution = JSON.parse(JSON.stringify(currentSolution)); // Deep copy
      bestScore = currentScore;
      scores.push(bestScore);

      // Add deep copy to dataset
      cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
      moveDataSets.push([
        [z1, y1, x1],
        [z2, y2, x2],
      ]);
      currentDataIndex = cubeDataSets.length - 1;
      console.log(bestScore);

      updateCubes();

      await new Promise((resolve) => setTimeout(resolve, delayTime));
      console.log("Step complete.");
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log("100ms delay complete.");
    } else {
      console.log("No better neighbor found, stopping.");
      break;
    }
  }

  updateCubes();

  return { solution: bestSolution, bestScore: bestScore, scores: scores };
}

async function HillClimbRandomRestart(restarts = 5) {
  let bestOverallSolution = null;
  let bestOverallScore = Infinity;
  let scores = [];
  let perRestartIterations = [];
  let iterationCount = 0;

  paused = false;
  canceled = false;

  // Clear data
  cubeDataSets = [];
  moveDataSets = [];
  currentDataIndex = -1;

  for (let restart = 0; restart < restarts; restart++) {
    console.log(`Restart #${restart + 1}`);
    reset();

    let cube = generateRandomData();
    cubeDataSets.push(cube);
    currentDataIndex++;
    updateCubes();

    const n = cube.length;
    const magicNumber = calculateMagicNumber(n);

    let currentSolution = cube;
    let currentScore = calculateScore(currentSolution, magicNumber);
    let bestSolution = JSON.parse(JSON.stringify(currentSolution));
    let bestScore = currentScore;
    let restartScores = [];
    let iterationCounter = 0;

    while (true) {
      if (canceled) {
        console.log("Simulation canceled.");
        return {
          solution: bestOverallSolution,
          bestScore: bestOverallScore,
          scores,
          perRestartIterations,
        };
      }

      while (paused) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      let { bestNeighbor, bestValue: newScore } =
        findBestNeighbor(currentSolution);

      if (bestNeighbor) {
        const [[z1, y1, x1], [z2, y2, x2]] = bestNeighbor;
        if (newScore >= currentScore) {
          break;
        }

        swapElement(currentSolution, x1, y1, z1, x2, y2, z2);

        currentScore = newScore;
        bestSolution = JSON.parse(JSON.stringify(currentSolution));
        bestScore = currentScore;
        restartScores.push(bestScore);
        iterationCounter++;
        iterationCount++;

        cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
        moveDataSets.push([
          [z1, y1, x1],
          [z2, y2, x2],
        ]);
        currentDataIndex = cubeDataSets.length - 1;
        updateCubes();

        await new Promise((resolve) => setTimeout(resolve, delayTime));
      } else {
        break;
      }
    }

    perRestartIterations.push(iterationCounter);

    scores.push(...restartScores);

    if (bestScore < bestOverallScore) {
      bestOverallScore = bestScore;
      bestOverallSolution = JSON.parse(JSON.stringify(bestSolution));
    }

    console.log(`Best score for restart #${restart + 1}: ${bestScore}`);
  }

  console.log("Best overall solution found:", bestOverallSolution);
  console.log("Best overall score:", bestOverallScore);

  updateCubes();

  return {
    solution: bestOverallSolution,
    bestScore: bestOverallScore,
    scores: scores,
    perRestartIterations: perRestartIterations,
  };
}

let chartInstance;
let etChartInstance;
async function runAlgorithm(algorithmFunction) {
  document.getElementById("durationValue").textContent = "Processing...";
  document.getElementById("objectiveValue").textContent = "Calculating...";
  document.getElementById("iterationsValue").textContent = "Calculating...";

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (etChartInstance) {
    etChartInstance.destroy();
    etChartInstance = null;
  }

  const startTime = performance.now();
  const algoResult = await algorithmFunction();

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  document.getElementById("durationValue").textContent = `${duration} seconds`;
  document.getElementById("objectiveValue").textContent = algoResult.bestScore;
  document.getElementById("iterationsValue").textContent =
    algoResult.scores.length;

  if (algoResult.perRestartIterations) {
    plotChart(algoResult.scores, algoResult.perRestartIterations);
  }
  if (algoResult.et) {
    plotChart(algoResult.scores, null, algoResult.et);
  } else {
    plotChart(algoResult.scores);
  }
}

function plotChart(scores, perRestartIterations = null, etArray = null) {
  const ctx = document.getElementById("objectiveChart").getContext("2d");

  let datasets = [];
  let maxIterations = 0;

  if (perRestartIterations) {
    let startIdx = 0;
    perRestartIterations.forEach((iterations, restartIndex) => {
      const restartScores = scores.slice(startIdx, startIdx + iterations);
      datasets.push({
        label: `Restart ${restartIndex + 1}`,
        data: restartScores,
        borderColor: `rgba(${75 + restartIndex * 30}, ${
          192 - restartIndex * 20
        }, ${192 - restartIndex * 30}, 1)`,
        borderWidth: 2,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 3,
      });
      startIdx += iterations;

      if (iterations > maxIterations) {
        maxIterations = iterations;
      }
    });
  } else {
    datasets.push({
      label: "Objective Function per Iteration",
      data: scores,
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 2,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 3,
    });

    maxIterations = scores.length;
  }

  const labels = Array.from({ length: maxIterations }, (_, index) => index + 1);

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Iteration",
          },
        },
        y: {
          title: {
            display: true,
            text: "Objective Function Value",
          },
        },
      },
    },
  });

  if (etArray) {
    const filteredEtArray = etArray
      .map((value, index) => ({ value, index }))
      .filter((item) => item.value !== 1);

    if (filteredEtArray.length > 0) {
      const etCtx = document.getElementById("etChart").getContext("2d");

      etChartInstance = new Chart(etCtx, {
        type: "line",
        data: {
          labels: filteredEtArray.map((item) => item.index + 1),
          datasets: [
            {
              label: "ET per Iteration",
              data: filteredEtArray.map((item) => item.value),
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Iteration",
              },
            },
            y: {
              title: {
                display: true,
                text: "P Value",
              },
            },
          },
        },
      });
    }
  }
}

document.getElementById("hillClimbingButton").addEventListener("click", () => {
  runAlgorithm(hillClimbSteepest);
});

document
  .getElementById("hillClimbingStochasticButton")
  .addEventListener("click", () => {
    runAlgorithm(hillClimbStochastic);
  });

document
  .getElementById("hillClimbingRandomRestartButton")
  .addEventListener("click", () => {
    const numRestarts = parseInt(document.getElementById("numRestarts").value);
    runAlgorithm(() => HillClimbRandomRestart(numRestarts));
  });

document
  .getElementById("hillClimbingSideWaysButton")
  .addEventListener("click", () => {
    const maxSidewaysInput = parseInt(
      document.getElementById("sidewaysMoves").value
    );
    maxSideways = maxSidewaysInput;
    runAlgorithm(hillClimbSideways);
  });

document
  .getElementById("simulatedAnnealingButton")
  .addEventListener("click", () => {
    runAlgorithm(simulatedAnnealing);
  });

document
  .getElementById("geneticAlgorithmButton")
  .addEventListener("click", () => {
    const populationSize = parseInt(
      document.getElementById("populationSize").value
    );
    const maxIterations = parseInt(
      document.getElementById("maxIterationsGA").value
    );
    runAlgorithm(() => geneticAlgorithm(populationSize, maxIterations));
  });

function generateInitialPopulation(populationSize) {
  const gridSize = 5;
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    const individual = generateRandomData(gridSize);
    population.push(individual);
  }
  return population;
}

function calculateFitness(cube, magicNumber) {
  return calculateScore(cube, magicNumber);
}

function selectParents(population, fitnessValues) {
  const totalFitness = fitnessValues.reduce(
    (sum, value) => sum + 1 / (1 + value),
    0
  );
  const selectionProbability = fitnessValues.map(
    (value) => 1 / (1 + value) / totalFitness
  );

  const select = () => {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < population.length; i++) {
      cumulative += selectionProbability[i];
      if (rand <= cumulative) {
        return population[i];
      }
    }
    return population[population.length - 1]; // Fallback
  };

  return [select(), select()];
}

function orderedCrossover(parent1, parent2) {
  const gridSize = parent1.length;
  const totalElements = gridSize * gridSize * gridSize;

  // Flatten the 3D arrays for crossover
  const flatParent1 = parent1.flat(2);
  const flatParent2 = parent2.flat(2);

  const start = Math.floor(Math.random() * totalElements);
  const end = start + Math.floor(Math.random() * (totalElements - start));

  // Create child with a slice from parent1
  const child1 = new Array(totalElements).fill(null);
  const child2 = new Array(totalElements).fill(null);

  for (let i = start; i < end; i++) {
    child1[i] = flatParent1[i];
    child2[i] = flatParent2[i];
  }

  let currentIndex1 = 0;
  let currentIndex2 = 0;

  for (let i = 0; i < totalElements; i++) {
    if (!child1.includes(flatParent2[i])) {
      while (child1[currentIndex1] !== null) {
        currentIndex1++;
      }
      child1[currentIndex1] = flatParent2[i];
    }
    if (!child2.includes(flatParent1[i])) {
      while (child2[currentIndex2] !== null) {
        currentIndex2++;
      }
      child2[currentIndex2] = flatParent1[i];
    }
  }

  const child3D1 = [];
  const child3D2 = [];
  let index = 0;

  for (let x = 0; x < gridSize; x++) {
    child3D1[x] = [];
    child3D2[x] = [];
    for (let y = 0; y < gridSize; y++) {
      child3D1[x][y] = [];
      child3D2[x][y] = [];
      for (let z = 0; z < gridSize; z++) {
        child3D1[x][y][z] = child1[index];
        child3D2[x][y][z] = child2[index];
        index++;
      }
    }
  }

  return [child3D1, child3D2];
}

function mutate(cube, mutationRate) {
  const gridSize = cube.length;
  if (Math.random() < mutationRate) {
    const x1 = Math.floor(Math.random() * gridSize);
    const y1 = Math.floor(Math.random() * gridSize);
    const z1 = Math.floor(Math.random() * gridSize);
    const x2 = Math.floor(Math.random() * gridSize);
    const y2 = Math.floor(Math.random() * gridSize);
    const z2 = Math.floor(Math.random() * gridSize);

    // Swap elements
    const temp = cube[x1][y1][z1];
    cube[x1][y1][z1] = cube[x2][y2][z2];
    cube[x2][y2][z2] = temp;
  }
}

function updateVisualization(cubeData) {
  for (let x = 0; x < cubeData.length; x++) {
    for (let y = 0; y < cubeData[x].length; y++) {
      for (let z = 0; z < cubeData[x][y].length; z++) {
        const value = cubeData[x][y][z];
        const cube = cubes[x][y][z];

        // Create canvas for number texture
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
        context.fillText(value.toString(), canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        cube.material.map = texture;
        cube.material.needsUpdate = true;
      }
    }
  }
}

async function geneticAlgorithm(populationSize = 10, maxIterations = 1000) {
  const gridSize = 5; // Fixed grid size of 5 (5x5x5)
  const magicNumber = calculateMagicNumber(gridSize);
  let population = generateInitialPopulation(populationSize);
  let bestSolution = population[0];
  let bestScore = calculateFitness(bestSolution, magicNumber);

  // Data variables to store iterations
  cubeDataSets = []; // Clear previous data
  currentDataIndex = -1;
  let scores = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (canceled) {
      console.log("Simulation canceled.");
      break;
    }

    while (paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const fitnessValues = population.map((individual) =>
      calculateFitness(individual, magicNumber)
    );

    // Find the best solution in the current population
    for (let i = 0; i < populationSize; i++) {
      const currentScore = fitnessValues[i];
      if (currentScore < bestScore) {
        bestSolution = JSON.parse(JSON.stringify(population[i])); // Deep copy
        bestScore = currentScore;
      }
    }

    scores.push(bestScore);

    // Save current best state for navigation
    if (
      !cubeDataSets.some(
        (data) => JSON.stringify(data) === JSON.stringify(bestSolution)
      )
    ) {
      cubeDataSets.push(JSON.parse(JSON.stringify(bestSolution)));
      currentDataIndex = cubeDataSets.length - 1;
    }

    updateVisualization(bestSolution);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create new population
    for (let i = 0; i < populationSize; i += 2) {
      const [parent1, parent2] = selectParents(population, fitnessValues);
      let [child1, child2] = orderedCrossover(parent1, parent2);
      mutate(child1, 0.1);
      mutate(child2, 0.1);

      population[i] = child1;
      if (i + 1 < populationSize) {
        population[i + 1] = child2;
      }
    }

    console.log(`Iteration ${iteration + 1}: Best Score = ${bestScore}`);
    if (bestScore === 0) break;
  }

  return { bestSolution: bestSolution, bestScore: bestScore, scores: scores };
}

document.getElementById("viewStartButton").addEventListener("click", () => {
  currentDataIndex = 1;
  updateCubes();
});

document.getElementById("viewEndButton").addEventListener("click", () => {
  currentDataIndex = cubeDataSets.length - 1;
  updateCubes();
});
