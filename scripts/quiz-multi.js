
const wordsContainer = document.querySelector(".words");
const targetsContainer = document.querySelector(".targets");
const scoreText = document.getElementById("score");
const message = document.getElementById("message");
const nextBtn = document.getElementById("nextBtn");

let currentQuizIndex = 0;
let score = 0;

const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// Utilitaire : Fisher–Yates shuffle
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Charger un quiz ---
function loadQuiz(index) {
  wordsContainer.innerHTML = "";
  targetsContainer.innerHTML = "";
  message.classList.remove("show");
  nextBtn.style.display = "none";
  score = 0;

  const quizData = quizzes[index];
  scoreText.textContent = `Score : ${score} / ${quizData.length}`;

  const shuffledWords = shuffle(quizData);
  const shuffledTargets = shuffle(quizData);

  // --- Générer les mots ---
  shuffledWords.forEach((item) => {
    const div = document.createElement("div");
    div.className = "word";
    div.draggable = true;
    div.dataset.translation = item.mot;
    if (item.son) div.dataset.son = item.son;
    div.textContent = item.arabe;

    // 🎵 son au clic
    div.addEventListener("click", () => {
      if (div.dataset.son) {
        const audio = new Audio(div.dataset.son);
        audio.currentTime = 0;
        audio.play();
      }
    });

    wordsContainer.appendChild(div);
  });

  // --- Générer les cibles ---
  shuffledTargets.forEach((item) => {
    const target = document.createElement("div");
    target.className = "target";
    target.dataset.answer = item.mot;

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.mot;

    target.appendChild(img);
    targetsContainer.appendChild(target);
  });

  initDragDrop();
}

// --- Vérifie si c’est correct ---
function checkMatch(target, droppedWord) {
  if (droppedWord === target.dataset.answer && !target.classList.contains("correct")) {
    target.classList.add("correct");
    correctSound.currentTime = 0;
    correctSound.play();
    score++;
    scoreText.textContent = `Score : ${score} / ${document.querySelectorAll(".target").length}`;

    if (score === document.querySelectorAll(".target").length) {
      message.classList.add("show");
      nextBtn.style.display = "inline-block";
    }
  } else {
    target.classList.add("wrong");
    wrongSound.currentTime = 0;
    wrongSound.play();
    setTimeout(() => target.classList.remove("wrong"), 700);
  }
}

// --- Drag & Drop + Mobile Touch ---
function initDragDrop() {
  const words = document.querySelectorAll(".word");
  const targets = document.querySelectorAll(".target");

  // --- PC : drag & drop ---
  words.forEach((word) => {
    word.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", word.dataset.translation);
      word.classList.add("dragging");
    });

    word.addEventListener("dragend", () => {
      word.classList.remove("dragging");
    });
  });

  targets.forEach((target) => {
    target.addEventListener("dragover", (e) => e.preventDefault());

    target.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropped = e.dataTransfer.getData("text/plain");
      checkMatch(target, dropped);
    });
  });

  // --- Mobile : touch ---
  let selected = null;

  words.forEach((word) => {
    word.addEventListener("touchstart", (e) => {
      selected = word;
      word.classList.add("dragging");
      e.preventDefault();
    });

    word.addEventListener("touchmove", (e) => {
      if (!selected) return;
      const touch = e.touches[0];
      selected.style.position = "absolute";
      selected.style.zIndex = "999";
      selected.style.left = touch.clientX - 50 + "px";
      selected.style.top = touch.clientY - 40 + "px";
    });

    word.addEventListener("touchend", (e) => {
      if (!selected) return;

      const touch = e.changedTouches[0];
      let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

      // 📌 Très important pour iPhone / Android :
      if (dropTarget && dropTarget.tagName === "IMG") {
        dropTarget = dropTarget.parentElement;
      }

      // Reset visuel
      selected.classList.remove("dragging");
      selected.style.position = "static";
      selected.style.left = "";
      selected.style.top = "";
      selected.style.zIndex = "";

      if (dropTarget && dropTarget.classList.contains("target")) {
        checkMatch(dropTarget, selected.dataset.translation);
      }

      selected = null;
    });
  });
}

// --- Bouton suivant ---
nextBtn.addEventListener("click", () => {
  currentQuizIndex++;
  if (currentQuizIndex < quizzes.length) {
    loadQuiz(currentQuizIndex);
  } else {
    alert("🎉 Félicitations ! Tu as terminé tous les quiz !");
    nextBtn.style.display = "none";
  }
});

// --- Charger le premier quiz ---
loadQuiz(currentQuizIndex);

