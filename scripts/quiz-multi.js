const wordsContainer = document.querySelector(".words");
const targetsContainer = document.querySelector(".targets");
const scoreText = document.getElementById("score");
const message = document.getElementById("message");
const nextBtn = document.getElementById("nextBtn");

let currentQuizIndex = 0;
let score = 0;

const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// utilitaire : Fisher–Yates
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

  // Générer les mots
  shuffledWords.forEach((item) => {
    const div = document.createElement("div");
    div.className = "word";
    div.draggable = true;
    div.dataset.translation = item.mot;
    if (item.son) div.dataset.son = item.son;
    div.textContent = item.arabe;

    div.addEventListener("click", () => {
      if (div.dataset.son) {
        const audio = new Audio(div.dataset.son);
        audio.currentTime = 0;
        audio.play();
      }
    });

    wordsContainer.appendChild(div);
  });

  // Générer les cibles
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
  initTouchDrag();
}

/* -----------------------------------------------------
   🎯 VERSION MOBILE : Drag & drop tactile
----------------------------------------------------- */

function initTouchDrag() {
  const words = document.querySelectorAll(".word");
  let selected = null;

  words.forEach((word) => {
    word.addEventListener("touchstart", (e) => {
      selected = word;
      selected.classList.add("dragging");
      const touch = e.touches[0];
      selected.startX = touch.clientX;
      selected.startY = touch.clientY;
      selected.style.position = "fixed";
      selected.style.zIndex = 1000;
    });

    word.addEventListener("touchmove", (e) => {
      if (!selected) return;

      const touch = e.touches[0];
      selected.style.left = touch.clientX - selected.offsetWidth / 2 + "px";
      selected.style.top = touch.clientY - selected.offsetHeight / 2 + "px";
    });

    word.addEventListener("touchend", (e) => {
      if (!selected) return;

      const touch = e.changedTouches[0];
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

      selected.classList.remove("dragging");
      selected.style.position = "static";
      selected.style.zIndex = "";
      selected.style.left = "";
      selected.style.top = "";

      if (dropTarget && dropTarget.classList.contains("target")) {
        checkMatch(dropTarget, selected.dataset.translation);
      }

      selected = null;
    });
  });
}

/* -----------------------------------------------------
   🎯 Version PC (drag & drop classique)
----------------------------------------------------- */

function initDragDrop() {
  const words = document.querySelectorAll(".word");
  const targets = document.querySelectorAll(".target");

  words.forEach((word) => {
    word.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", word.dataset.translation);
      word.classList.add("dragging");
    });
    word.addEventListener("dragend", () => word.classList.remove("dragging"));
  });

  targets.forEach((target) => {
    target.addEventListener("dragover", (e) => e.preventDefault());
    target.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropped = e.dataTransfer.getData("text/plain");
      checkMatch(target, dropped);
    });
  });
}

/* -----------------------------------------------------
   🎯 Vérification commune (PC + mobile)
----------------------------------------------------- */

function checkMatch(target, droppedValue) {
  if (
    droppedValue === target.dataset.answer &&
    !target.classList.contains("correct")
  ) {
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

/* 🔵 Bouton suivant */
nextBtn.addEventListener("click", () => {
  currentQuizIndex++;
  if (currentQuizIndex < quizzes.length) {
    loadQuiz(currentQuizIndex);
  } else {
    alert("🎉 Félicitations ! Tu as terminé tous les quiz !");
    nextBtn.style.display = "none";
  }
});

/* 🔵 Charger le premier quiz */
loadQuiz(currentQuizIndex);

