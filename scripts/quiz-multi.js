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
  const a = array.slice(); // copie pour ne pas modifier l'original
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

  // --- Créer des copies mélangées ---
  const shuffledWords = shuffle(quizData); // on mélangera l'affichage des mots
  const shuffledTargets = shuffle(quizData); // tu peux aussi garder targets non mélangées si tu veux

  // Générer les mots (ordre mélangé)
  shuffledWords.forEach((item) => {
    const div = document.createElement("div");
    div.className = "word";
    div.draggable = true;
    div.dataset.translation = item.mot;
    if (item.son) div.dataset.son = item.son;
    div.textContent = item.arabe;

    // jouer son au clic (si présent)
    div.addEventListener("click", () => {
      if (div.dataset.son) {
        const audio = new Audio(div.dataset.son);
        audio.currentTime = 0;
        audio.play();
      }
    });

    wordsContainer.appendChild(div);
  });

  // Générer les cibles (ordre mélangé ou non, selon ton choix)
  // ici je prends shuffledTargets pour que les images aussi soient mélangées
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

// 🎯 Drag & Drop
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

      if (
        dropped === target.dataset.answer &&
        !target.classList.contains("correct")
      ) {
        target.classList.add("correct");
        correctSound.currentTime = 0;
        correctSound.play();
        score++;
        scoreText.textContent = `Score : ${score} / ${targets.length}`;
        if (score === targets.length) {
          message.classList.add("show");
          nextBtn.style.display = "inline-block"; // bouton visible
        }
      } else {
        target.classList.add("wrong");
        wrongSound.currentTime = 0;
        wrongSound.play();
        setTimeout(() => target.classList.remove("wrong"), 700);
      }
    });
  });
}

// 🔵 Bouton suivant
nextBtn.addEventListener("click", () => {
  currentQuizIndex++;
  if (currentQuizIndex < quizzes.length) {
    loadQuiz(currentQuizIndex);
  } else {
    alert("🎉 Félicitations ! Tu as terminé tous les quiz !");
    nextBtn.style.display = "none";
  }
});

// 🔵 Charger le premier quiz
loadQuiz(currentQuizIndex);
