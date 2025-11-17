// Détection mobile
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Sélecteurs
const wordsContainer = document.getElementById("words");
const targetsContainer = document.getElementById("targets");
const restartBtn = document.getElementById("restart");
const correctSound = new Audio("../audio/correct2.WAV");
      const wrongSound = new Audio("../audio/wrong2.WAV");

let quizIndex = 0; // pour passer quiz 1 → quiz 2 → etc.

// Mélange
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function loadQuiz() {
    wordsContainer.innerHTML = "";
    targetsContainer.innerHTML = "";

    const quiz = quizzes[quizIndex];      // quiz actuel
    const wordsList = shuffle([...quiz]); // copie mélangée
    const targetsList = shuffle([...quiz]);

    // -------------------------
    // Génération des MOTS (arabe)
    // -------------------------
    wordsList.forEach(item => {
        const w = document.createElement("div");
        w.className = "word";
        w.textContent = item.arabe;
        w.dataset.mot = item.mot;
        w.dataset.son = item.son;
        w.dataset.key = item.mot; // identifiant unique

        w.draggable = !isMobile; // PC → drag, mobile → tap

        // Son au clic
        w.addEventListener("click", () => {
            if (item.son) {
                const audio = new Audio(item.son);
                audio.play();
            }
        });

        wordsContainer.appendChild(w);
    });

    // -------------------------
    // Génération des IMAGES (cibles)
    // -------------------------
    targetsList.forEach(item => {
        const t = document.createElement("div");
        t.className = "target";
        t.dataset.key = item.mot; // identifiant unique

        const img = document.createElement("img");
        img.src = item.image;

        t.appendChild(img);
        targetsContainer.appendChild(t);
    });

    // Activer mode mobile / PC
    if (isMobile) enableMobileMode();
    else enableDesktopMode();
}

////////////////////////////////////////////
// PC → DRAG & DROP
////////////////////////////////////////////
function enableDesktopMode() {
    const words = document.querySelectorAll(".word");
    const targets = document.querySelectorAll(".target");

    let dragged = null;

    words.forEach(w => {
        w.addEventListener("dragstart", () => dragged = w);
    });

    targets.forEach(t => {
        t.addEventListener("dragover", e => e.preventDefault());
        t.addEventListener("drop", () => {
            if (!dragged) return;

            if (dragged.dataset.key === t.dataset.key) {
                t.classList.add("good");
                correctSound.play(); // ✅ joue le son correct
                t.innerHTML = dragged.dataset.mot;
                dragged.style.opacity = "0.3";
                dragged.draggable = false;

                checkQuizComplete();
            } else {
                t.classList.add("wrong");
                wrongSound.play(); // ❌ joue le son erreur
                setTimeout(() => t.classList.remove("wrong"), 600);
            }
        });
    });
}

////////////////////////////////////////////
// MOBILE → TAP MOT → TAP IMAGE
////////////////////////////////////////////
function enableMobileMode() {
    let selectedWord = null;
    const words = document.querySelectorAll(".word");
    const targets = document.querySelectorAll(".target");

    // Tap sur MOT
    words.forEach(w => {
        w.addEventListener("click", () => {
            // Désélectionner tous
            words.forEach(x => x.classList.remove("selected"));

            selectedWord = w;
            w.classList.add("selected");

            // Jouer le son
            if (w.dataset.son) {
                const audio = new Audio(w.dataset.son);
                audio.play();
            }
        });
    });

    // Tap sur IMAGE
    targets.forEach(t => {
        t.addEventListener("click", () => {
            if (!selectedWord) return;

            if (selectedWord.dataset.key === t.dataset.key) {
                t.classList.add("good");
                correctSound.play(); // ✅ joue le son correct
                t.innerHTML = selectedWord.dataset.mot;

                selectedWord.style.opacity = "0.3";
                selectedWord.classList.remove("selected");
                selectedWord = null;

                checkQuizComplete();
            } else {
                t.classList.add("wrong");
                wrongSound.play(); // ❌ joue le son erreur
                setTimeout(() => t.classList.remove("wrong"), 500);
            }
        });
    });
}

///////////////////////////////////////////
// VÉRIFIER SI TOUT EST BON
///////////////////////////////////////////
function checkQuizComplete() {
    const goodCount = document.querySelectorAll(".target.good").length;
    const total = document.querySelectorAll(".target").length;

    if (goodCount === total) {
        setTimeout(() => {
            quizIndex++;
            if (quizIndex < quizzes.length) {
                alert("✔ Bravo ! Prochain quiz !");
                loadQuiz();
            } else {
                alert("🎉 Tu as terminé tous les quiz !");
            }
        }, 500);
    }
}

restartBtn.addEventListener("click", loadQuiz);

// Charger premier quiz
loadQuiz();




