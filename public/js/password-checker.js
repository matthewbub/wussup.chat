const passwordInput = document.getElementById("passwordInput");
const strengthInfo = document.getElementById("strengthInfo");
const strengthMeterFill = document.getElementById("strengthMeterFill");
const guessTimesTable = document.getElementById("guessTimesTable");
const matchSequence = document.getElementById("matchSequence");

let strengthData = {
  guessesLog10: 0,
  score: 0,
  guessTimes: {},
  matchSequence: [],
};

function updateStrengthMeter(score) {
  const colors = ["#ff4d4d", "#ffa64d", "#ffff4d", "#4dff4d"];
  const width = (score / 4) * 100;
  strengthMeterFill.style.width = `${width}%`;
  strengthMeterFill.style.backgroundColor = colors[score - 1] || "#e0e0e0";
}

function updateStrengthInfo() {
  strengthInfo.innerHTML = `
    <p>Strength Score: ${strengthData.score} / 4</p>    
  `;
  updateStrengthMeter(strengthData.score);
}

function updateUI() {
  updateStrengthInfo();
}

document.addEventListener("DOMContentLoaded", () => {
  passwordInput.addEventListener("input", (e) => {
    const password = e.target.value;
    const result = zxcvbn(password);

    // Update strengthData with the result from zxcvbn
    strengthData = {
      guessesLog10: Math.log10(result.guesses),
      score: result.score,
      guessTimes: result.crack_times_display,
      matchSequence: result.sequence,
    };

    updateUI();
  });

  // Initial UI update
  updateUI();
});
