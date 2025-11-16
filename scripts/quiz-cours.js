const quiz = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const answersEls = document.querySelectorAll(".answer");
const submitBtn = document.getElementById("submit");
const result = document.getElementById("result");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const reloadBtn = document.getElementById("reload");

let currentQuiz = 0;
let score = 0;
let selectedAnswer = null;

// 🔊 Sons généraux
const correctSound = new Audio("../audio/correct.mp3");
const wrongSound = new Audio("../audio/wrong.mp3");
const encouragerSound = new Audio("../audio/applaudissment.wav");
loadQuiz();

function loadQuiz() {
  deselectAnswers();
  const currentQuizData = quizData[currentQuiz];
  questionEl.textContent = `${currentQuiz + 1}- ${currentQuizData.question}`;

  // Afficher l'image si présente
  const imageContainer = document.getElementById("question-image");
  if (currentQuizData.image) {
    imageContainer.innerHTML = `<img src="${currentQuizData.image}" alt="illustration" class="quiz-image">`;
  } else {
    imageContainer.innerHTML = "";
  }

  // --- 🎯 Mélanger les réponses ---
  let answersArray = [
    { key: "a", text: currentQuizData.a },
    { key: "b", text: currentQuizData.b },
    { key: "c", text: currentQuizData.c },
    { key: "d", text: currentQuizData.d },
  ];

  answersArray.sort(() => Math.random() - 0.5);

  answersArray.forEach((ans, index) => {
    const answerEl = answersEls[index];
    answerEl.textContent = ans.text;
    answerEl.dataset.answer = ans.key;
  });
}

// 🔊 Jouer le son de la question quand on clique sur le texte
questionEl.addEventListener("click", () => {
  const currentQuizData = quizData[currentQuiz];
  if (currentQuizData.questionSound) {
    const sound = new Audio(currentQuizData.questionSound);
    sound.play();
  }
});

// 🎧 Quand on clique sur une réponse
answersEls.forEach((answer) => {
  answer.addEventListener("click", () => {
    deselectAnswers();
    answer.classList.add("selected");
    selectedAnswer = answer.dataset.answer;

    // 🔊 Jouer le son de la réponse choisie (si défini)
    const currentQuizData = quizData[currentQuiz];
    if (currentQuizData.sounds && currentQuizData.sounds[selectedAnswer]) {
      const soundPath = currentQuizData.sounds[selectedAnswer];
      const sound = new Audio(soundPath);
      sound.play();
    }
  });
});

function deselectAnswers() {
  answersEls.forEach((a) => a.classList.remove("selected"));
  selectedAnswer = null;
}

// ✅ Bouton "Valider"
submitBtn.addEventListener("click", () => {
  if (!selectedAnswer) {
    alert("Veuillez choisir une réponse !");
    return;
  }

  const correct = quizData[currentQuiz].correct;
  const selectedEl = document.querySelector(
    `[data-answer="${selectedAnswer}"]`
  );

  // Supprimer d'anciennes classes
  answersEls.forEach((a) => a.classList.remove("correct", "wrong"));

  if (selectedAnswer === correct) {
    selectedEl.classList.add("correct");
    correctSound.currentTime = 0;
    correctSound.play();
    score++;
  } else {
    selectedEl.classList.add("wrong");
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  setTimeout(() => {
    answersEls.forEach((a) =>
      a.classList.remove("correct", "wrong", "selected")
    );
    currentQuiz++;
    selectedAnswer = null;

    if (currentQuiz < quizData.length) {
      loadQuiz();
    } else {
      showResult();
    }
  }, 700);
});

// 🎯 Affichage du résultat final
function showResult() {
  quiz.classList.add("hidden");
  result.classList.remove("hidden");
  result.classList.remove("bravo", "faible");

  const oldMessage = result.querySelector(".message");
  if (oldMessage) oldMessage.remove();

  const messageEl = document.createElement("p");
  messageEl.classList.add("message");

  if (score >= 7) {
    result.classList.add("bravo");
    messageEl.textContent = "Bravo ! 🎉 Vous avez bien compris.";
    encouragerSound.play();
  } else if (score >= 5) {
    result.classList.add("moyen");
    messageEl.textContent = "Continuez à vous entraîner 💪";
  } else {
    result.classList.add("faible");
    messageEl.textContent = "Ne baissez pas les bras ! Réessayez 🔁";
  }

  scoreEl.textContent = score;
  totalEl.textContent = quizData.length;
  result.appendChild(messageEl);

  // ------------------------------
  // ⭐ AJOUT DU BOUTON "التالي"
  // ------------------------------
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "التالي - Suivant";
  nextBtn.style.marginTop = "20px";
  nextBtn.style.padding = "10px 20px";
  nextBtn.style.fontSize = "20px";
  nextBtn.style.cursor = "pointer";

  // ➜ Redirection vers ton quiz drag & drop
  nextBtn.onclick = () => {
    window.location.href = "quiz-jours-nombres.html";
  };

  result.appendChild(nextBtn);
}

// 🔄 Recommencer
reloadBtn.addEventListener("click", () => {
  currentQuiz = 0;
  score = 0;
  result.classList.add("hidden");
  quiz.classList.remove("hidden");
  loadQuiz();
});
