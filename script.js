let questions = [], currentQuestion = 0, score = 0, correctAnswer = "", timer, timeLeft = 30;
let userName = "", totalQuestions = 5;

function startQuiz() {
  userName = document.getElementById("username").value.trim();
  const category = document.getElementById("category").value;
  totalQuestions = parseInt(document.getElementById("questionCount").value);

  if (!userName) {
    alert("Please enter your name before starting the quiz.");
    return;
  }

  fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&category=${category}&type=multiple`)
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      score = 0;
      currentQuestion = 0;
      document.getElementById("quiz").style.display = "block";
      document.getElementById("category").style.display = "none";
      document.getElementById("questionCount").style.display = "none";
      document.getElementById("username").style.display = "none";
      document.querySelector("button").style.display = "none";
      showQuestion();
    });
}

function showQuestion() {
  if (currentQuestion >= questions.length) return showResult();
  const q = questions[currentQuestion];
  document.getElementById("question").textContent = decodeHTML(q.question);
  const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
  correctAnswer = q.correct_answer;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  answers.forEach(a => {
    const btn = document.createElement("button");
    btn.textContent = decodeHTML(a);
    btn.onclick = () => selectAnswer(btn, decodeHTML(a));
    answersDiv.appendChild(btn);
  });
  document.getElementById("next").style.display = "none";
  resetTimer();
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function selectAnswer(btn, answer) {
  clearInterval(timer);
  const buttons = document.querySelectorAll("#answers button");
  buttons.forEach(b => b.disabled = true);
  if (answer === correctAnswer) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("incorrect");
    buttons.forEach(b => {
      if (b.textContent === decodeHTML(correctAnswer)) b.classList.add("correct");
    });
  }
  document.getElementById("next").style.display = "inline-block";
}

function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

function showResult() {
  document.getElementById("quiz").style.display = "none";

  const name = userName;
  if (name) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score, date: new Date().toLocaleString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }

  const result = document.getElementById("result");
  result.innerHTML = `
    <h2>${userName}, you scored ${score}/${questions.length}</h2>
    <button onclick="goToStart()">Back to Start</button>
  `;
  result.style.display = "block";
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${entry.name} - ${entry.score} (${entry.date})`;
    list.appendChild(li);
  });
  document.getElementById("leaderboard").style.display = "block";
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoFail();
    }
  }, 1000);
}

function autoFail() {
  const buttons = document.querySelectorAll("#answers button");
  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent === decodeHTML(correctAnswer)) b.classList.add("correct");
  });
  document.getElementById("next").style.display = "inline-block";
}

function goToStart() {
  document.getElementById("username").style.display = "inline-block";
  document.getElementById("category").style.display = "inline-block";
  document.getElementById("questionCount").style.display = "inline-block";
  document.querySelector("button").style.display = "inline-block";
  document.getElementById("result").style.display = "none";
  document.getElementById("leaderboard").style.display = "none";
  score = 0;
  currentQuestion = 0;
}

function clearLeaderboard() {
  if (confirm("Are you sure you want to clear the leaderboard?")) {
    localStorage.removeItem("leaderboard");
    displayLeaderboard();
  }
}