// Détection mobile
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

let wordsContainer = document.getElementById("words");
let targetsContainer = document.getElementById("targets");
let restartBtn = document.getElementById("restart");

function shuffle(a) {
    return a.sort(() => Math.random() - 0.5);
}

function loadQuiz() {
    wordsContainer.innerHTML = "";
    targetsContainer.innerHTML = "";

    const data = shuffle([...quizData]); // copie mélangée

    // Générer mots
    data.forEach(item => {
        let w = document.createElement("div");
        w.className = "word";
        w.textContent = item.word;
        w.dataset.mot = item.word;
        w.dataset.translation = item.translation;
        w.dataset.sound = item.sound;
        w.draggable = !isMobile; // PC → drag | Mobile → no drag
        wordsContainer.appendChild(w);
    });

    // Générer images
    shuffle(data).forEach(item => {
        let t = document.createElement("div");
        t.className = "target";
        t.dataset.translation = item.translation;

        let img = document.createElement("img");
        img.src = item.image;

        t.appendChild(img);
        targetsContainer.appendChild(t);
    });

    if (isMobile) enableMobileMode();
    else enableDesktopMode();
}

//////////////////////////////////////////////////////////
// PC → DRAG & DROP
//////////////////////////////////////////////////////////
function enableDesktopMode() {
    const words = document.querySelectorAll(".word");
    const targets = document.querySelectorAll(".target");

    let dragged = null;

    words.forEach(w => {
        w.addEventListener("dragstart", () => {
            dragged = w;
        });
    });

    targets.forEach(t => {
        t.addEventListener("dragover", e => e.preventDefault());

        t.addEventListener("drop", () => {
            if (!dragged) return;

            if (dragged.dataset.translation === t.dataset.translation) {
                t.classList.add("good");
                t.innerHTML = dragged.dataset.mot;
                dragged.style.opacity = "0.3";
            } else {
                t.classList.add("wrong");
                setTimeout(() => t.classList.remove("wrong"), 600);
            }
        });
    });
}

//////////////////////////////////////////////////////////
// MOBILE → TAP MOT → TAP IMAGE
//////////////////////////////////////////////////////////
function enableMobileMode() {
    let selectedWord = null;

    const words = document.querySelectorAll(".word");
    const targets = document.querySelectorAll(".target");

    // Tap mot
    words.forEach(w => {
        w.addEventListener("click", () => {
            words.forEach(x => x.classList.remove("selected"));

            selectedWord = w;
            w.classList.add("selected");

            // Son
            if (w.dataset.sound) new Audio(w.dataset.sound).play();
        });
    });

    // Tap image
    targets.forEach(t => {
        t.addEventListener("click", () => {
            if (!selectedWord) return;

            if (selectedWord.dataset.translation === t.dataset.translation) {
                t.classList.add("good");
                t.innerHTML = selectedWord.dataset.mot;
                selectedWord.style.opacity = "0.3";
                selectedWord.classList.remove("selected");
                selectedWord = null;
            } else {
                t.classList.add("wrong");
                setTimeout(() => t.classList.remove("wrong"), 500);
            }
        });
    });
}

//////////////////////////////////////////////////////////
// BOUTON REJOUER
//////////////////////////////////////////////////////////
restartBtn.addEventListener("click", loadQuiz);

loadQuiz();

