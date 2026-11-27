import { onCorrectAnswer, onWrongAnswer } from "./game.js";

const questions = [
  {
    question: "What does HTML stand for?",
    answers: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Line"
    ],
    correct: 0
  },
  {
    question: "Which tag runs JavaScript?",
    answers: ["<js>", "<script>", "<code>", "<run>"],
    correct: 1
  },
  {
    question: "Which CSS property changes text color?",
    answers: ["font-color", "text-color", "color", "background"],
    correct: 2
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

function loadQuestion() {
  answered = false;
  answersEl.innerHTML = "";

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;

  for (let i = 0; i < q.answers.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = q.answers[i];

    btn.onclick = function () {
      if (answered) return;
      answered = true;

      if (i === q.correct) {
        score = score + 1;
        btn.style.backgroundColor = "green";
        onCorrectAnswer();
      } else {
        btn.style.backgroundColor = "red";
        onWrongAnswer();
      }

      setTimeout(goToNext, 900);
    };

    answersEl.appendChild(btn);
  }
}

function goToNext() {
  currentQuestion = currentQuestion + 1;

  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    answersEl.innerHTML = "";
    questionEl.textContent = "Quiz finished! Score: " + score + "/" + questions.length;
  }
}

loadQuestion();