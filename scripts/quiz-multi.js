
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

  // --- Mobile : touch (remplacer l'ancienne implémentation) ---
let selected = null;

words.forEach((word) => {
  // Sur mobile, jouer le son au touchstart pour feedback immédiat
  word.addEventListener("touchstart", (e) => {
    selected = word;
    word.classList.add("dragging");

    // jouer le son si défini (sur mobile on déclenche ici)
    if (word.dataset.son) {
      try {
        const audio = new Audio(word.dataset.son);
        audio.currentTime = 0;
        audio.play();
      } catch (err) {
        // ignore
      }
    }

    // positionner en absolute pour suivre le doigt
    // on ne fait PAS e.preventDefault() ici pour ne pas bloquer le click sur d'autres navigateurs
    selected.style.position = "absolute";
    selected.style.zIndex = "9999";
    // placer instantanément sous le doigt
    const touch = e.touches[0];
    selected.style.left = touch.clientX - selected.offsetWidth / 2 + "px";
    selected.style.top = touch.clientY - selected.offsetHeight / 2 + "px";
  }, { passive: true });

  word.addEventListener("touchmove", (e) => {
    if (!selected) return;
    const touch = e.touches[0];
    selected.style.left = touch.clientX - selected.offsetWidth / 2 + "px";
    selected.style.top = touch.clientY - selected.offsetHeight / 2 + "px";
  }, { passive: true });

  word.addEventListener("touchend", (e) => {
    if (!selected) return;

    const touch = e.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // 1) essayer elementsFromPoint (retourne la pile d'éléments sous le point)
    let elements = document.elementsFromPoint(x, y);

    // 2) rechercher un parent .target dans la pile
    let dropTarget = null;
    for (const el of elements) {
      if (el.classList && el.classList.contains("target")) {
        dropTarget = el;
        break;
      }
      // si c'est une IMG à l'intérieur d'une target, remonter
      if (el.tagName === "IMG" && el.parentElement && el.parentElement.classList.contains("target")) {
        dropTarget = el.parentElement;
        break;
      }
    }

    // 3) si pas trouvé, faire une recherche précise : vérifier tous les targets et comparer bounding rect (tolérance)
    if (!dropTarget) {
      const allTargets = document.querySelectorAll(".target");
      const tol = 10; // tolérance en px autour des targets
      for (const t of allTargets) {
        const r = t.getBoundingClientRect();
        if (x >= r.left - tol && x <= r.right + tol && y >= r.top - tol && y <= r.bottom + tol) {
          dropTarget = t;
          break;
        }
      }
    }

    // Réinitialiser la position visuelle du mot
    selected.classList.remove("dragging");
    selected.style.position = "static";
    selected.style.left = "";
    selected.style.top = "";
    selected.style.zIndex = "";

    // Si on a trouvé une target valide -> vérification
    if (dropTarget && dropTarget.classList.contains("target")) {
      checkMatch(dropTarget, selected.dataset.translation);
    }

    selected = null;
  }, { passive: true });
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


