// timer.js

let startTime = null;
let timerInterval = null;
let finalTime = null; // This variable tracks the *winning* time, not collision time

const timerDisplay = document.getElementById('timer');
const finishMessage = document.getElementById('finishMessage'); // This is your original win message

export function startTimer() {
  // Clear any existing timer to prevent multiple intervals
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  startTime = Date.now();
  finalTime = null; // Reset final time for a new game
  timerDisplay.textContent = `Tempo: 0s`; // Reset display immediately
  timerInterval = setInterval(() => {
    if (finalTime !== null) return; // If game has finished (won), stop updating
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Tempo: ${elapsed}s`;
  }, 1000);
}

// Função pública para finalizar o tempo (for winning)
export function finishGameTimer() {
  if (finalTime !== null) return; // Prevent multiple calls if already finished
  finalTime = Math.floor((Date.now() - startTime) / 1000);
  clearInterval(timerInterval);
  // The finishMessage will now be updated by script.js when the game ends (win or lose)
  // finishMessage.textContent = `🏁 Você terminou em ${finalTime} segundos!`;
  // finishMessage.classList.remove('hidden'); // This will be handled by script.js
}

// startTimer() is now called by script.js initializeGame()