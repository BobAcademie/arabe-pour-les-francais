const quizData = [
  {
    question: "ماذا فعل سامي في أول يوم في المدرسة؟ ",
    a: "ذهب إلى البيت",
    b: "التقى بزميل جديد",
    c: "لم يتحدث مع أحد",
    d: "لم يقل شيئاً",
    correct: "c",
  },
  {
    question: "؟ ماذا قال لزميله الجديد",
    a: "السلام عليكم",
    b: "الى اللقاء",
    c: "كم عمرك",
    d: "أين تسكن",
    correct: "a",
  },
  {
    question: " دهب سامي الى المدرسة  ما هو الفعل في هاته الجملة؟",
    a: "سامي",
    b: "إلى",
    c: "المدرسة",
    d: "دهب",
    correct: "d",
  },
  {
    question: "؟ما اسم الصديق الجديد لسامي",
    a: "علي",
    b: "آدم",
    c: "ريان",
    d: "جاسم",
    correct: "b",
  },
];

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
const correctSound = new Audio("../audios/ahsan.mp3");
const wrongSound = new Audio("../audios/wrong.wav");

loadQuiz();

function loadQuiz() {
  deselectAnswers();
  const currentQuizData = quizData[currentQuiz];
  questionEl.textContent = `${currentQuiz + 1}-${currentQuizData.question}`;
  document.getElementById("a_text").textContent = currentQuizData.a;
  document.getElementById("b_text").textContent = currentQuizData.b;
  document.getElementById("c_text").textContent = currentQuizData.c;
  document.getElementById("d_text").textContent = currentQuizData.d;
}

// Gérer la sélection visuelle
answersEls.forEach((answer) => {
  answer.addEventListener("click", () => {
    deselectAnswers();
    answer.classList.add("selected");
    selectedAnswer = answer.dataset.answer;
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

  if (score >= 2) {
    result.classList.add("bravo");
    messageEl.textContent = "Bravo ! 🎉 Vous avez bien compris le texte.";
  } else if (score < 2) {
    result.classList.add("faible");
    messageEl.textContent =
      "Continuez à vous entraîner, vous allez progresser ! 💪";
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


