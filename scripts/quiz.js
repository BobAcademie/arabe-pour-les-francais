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
// 🔊 Sons pour les réponses
const correctSound = new Audio("../audio/correct.MP3");
const wrongSound = new Audio("../audio/wrong.MP3");
const encoragerSound = new Audio("../audio/applaudissment.wav");

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
    { key: "d", text: currentQuizData.d }
  ];

  answersArray.sort(() => Math.random() - 0.5);

  answersArray.forEach((ans, index) => {
    const answerEl = answersEls[index];
    answerEl.textContent = ans.text;
    answerEl.dataset.answer = ans.key;
  });
}

// Gérer la sélection visuelle
answersEls.forEach((answer) => {
  answer.addEventListener("click", () => {
    deselectAnswers();
    answer.classList.add("selected");
    selectedAnswer = answer.dataset.answer;
  });
});

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
// appuyer sur le bouton Valider

submitBtn.addEventListener("click", () => {
  // Si aucune réponse sélectionnée, on alerte
  if (!selectedAnswer) {
    alert("Veuillez choisir une réponse !");
    return;
  }

  const correct = quizData[currentQuiz].correct;
  const selectedEl = document.querySelector(
    `[data-answer="${selectedAnswer}"]`
  );
  const correctEl = document.querySelector(`[data-answer="${correct}"]`);

  // Nettoyer d'éventuelles classes résiduelles avant d'appliquer les nouvelles
  answersEls.forEach((a) => a.classList.remove("correct", "wrong"));

  // Appliquer le feedback visuel
  if (selectedAnswer === correct) {
    if (selectedEl) {
      selectedEl.classList.add("correct");
      selectedEl.classList.remove("selected");
    }
    correctSound.currentTime = 0; // redémarre le son à chaque fois
    correctSound.play();
    score++;
  } else {
    if (selectedEl) {
      selectedEl.classList.remove("selected");
      selectedEl.classList.add("wrong");
    }
    wrongSound.currentTime = 0;
    wrongSound.play();
    // if (correctEl) correctEl.classList.add("correct"); // on montre aussi la bonne réponse
  }

  // Attendre un moment pour que l'utilisateur voie la couleur, puis passer à la suite
  setTimeout(() => {
    // retirer les styles visuels appliqués
    answersEls.forEach((a) =>
      a.classList.remove("correct", "wrong", "selected")
    );

    // avancer et réinitialiser la sélection
    currentQuiz++;
    selectedAnswer = null;

    if (currentQuiz < quizData.length) {
      loadQuiz();
    } else {
      showResult();
    }
  }, 700); // 1000 ms = 1 seconde (à ajuster si tu veux)
});

// la fonction affichage de resultat

function showResult() {
  quiz.classList.add("hidden");
  result.classList.remove("hidden");
  // Nettoyer les anciennes classes avant d'ajouter la nouvelle
  result.classList.remove("bravo", "faible");

  const messageEl = document.createElement("p");
  messageEl.classList.add("message"); // 💡 on ajoute une classe pour le cibler
  // Supprimer le message précédent s'il existe déjà
  const oldMessage = result.querySelector(".message");
  if (oldMessage) {
    oldMessage.remove();
  }

  if (score >= 7) {
    result.classList.add("bravo");
    messageEl.textContent = "Bravo ! 🎉 Vous avez bien compris .";
    encoragerSound.play();
  } else if (score < 7 && score >= 5) {
    result.classList.add("moyen");
    messageEl.textContent =
      "Continuez à vous entraîner, vous allez progresser ! 💪";
  } else if (score < 4) {
    result.classList.add("faible");
    messageEl.textContent = "Continuez à vous entraîner  ! ";
  }
  scoreEl.textContent = score;
  totalEl.textContent = quizData.length;
  result.appendChild(messageEl);
}

reloadBtn.addEventListener("click", () => {
  currentQuiz = 0;
  score = 0;
  result.classList.add("hidden");
  quiz.classList.remove("hidden");
  loadQuiz();
});







