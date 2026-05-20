const CORRECT_PIN = "990230";
const MENU_ITEMS = ["Home", "PDFs", "Test", "Study AI", "Setting"];
const MENU_ICONS = {
  Home: "home",
  PDFs: "pdf",
  Test: "test",
  "Study AI": "ai",
  Setting: "setting"
};

const state = {
  pin: "",
  screen: "login",
  activeMenu: "Home",
  sidebarOpen: true,
  studyTopics: [],
  selectedStudyTopic: null
};

const app = document.querySelector("#app");

function renderLogin() {
  state.screen = "login";
  state.pin = "";
  app.innerHTML = `
    <section class="login-screen">
      <div class="welcome">
        <div class="brand">Exam-AI</div>
        <div class="welcome-copy">
          <h1>Hello Rakesh</h1>
          <h2>Welcome to Exam-AI</h2>
          <p>Secure desktop access for your exam workspace.</p>
        </div>
        <div class="footer-credit">Made by Beyond Marks AI Academy</div>
      </div>

      <form class="pin-card" id="pinForm">
        <h3>Enter Access PIN</h3>
        <p>Use the six digit administrator PIN to continue.</p>
        <div class="pin-boxes" id="pinBoxes">${renderPinBoxes()}</div>
        <div class="pin-help">Type the PIN using your keyboard</div>
        <div class="actions">
          <button class="btn" type="button" id="clearPin">Clear</button>
          <button class="btn primary" type="submit">Unlock Dashboard</button>
        </div>
        <div class="status" id="pinStatus"></div>
      </form>
    </section>
  `;

  document.querySelector("#pinForm").addEventListener("submit", event => {
    event.preventDefault();
    submitPin();
  });

  document.querySelector("#clearPin").addEventListener("click", () => {
    state.pin = "";
    updatePin();
  });
}

function renderPinBoxes() {
  return Array.from({ length: 6 }, (_, index) => {
    const filled = index < state.pin.length;
    return `<div class="pin-box ${filled ? "filled" : ""}">${filled ? "*" : "_"}</div>`;
  }).join("");
}

function updatePin() {
  const boxes = document.querySelector("#pinBoxes");
  const status = document.querySelector("#pinStatus");
  if (!boxes) {
    return;
  }
  boxes.innerHTML = renderPinBoxes();
  status.textContent = "";
}

function submitPin() {
  if (state.pin === CORRECT_PIN) {
    renderDashboard();
    return;
  }

  const status = document.querySelector("#pinStatus");
  status.textContent = "Incorrect PIN. Please try again.";
  state.pin = "";
  document.querySelector("#pinBoxes").innerHTML = renderPinBoxes();
}

function renderDashboard() {
  state.screen = "dashboard";
  state.activeMenu = "Home";
  state.sidebarOpen = true;
  app.innerHTML = `
    <section class="dashboard" id="dashboard">
      <aside class="sidebar">
        <div class="sidebar-inner">
          <div class="side-brand" id="sideBrand">Exam-AI</div>
          <nav class="nav-list" id="navList"></nav>
          <button class="lock-btn" id="lockBtn" aria-label="Lock">
            ${renderIcon("lock")}
            <span class="lock-text">Lock</span>
          </button>
        </div>
        <button class="sidebar-handle" id="toggleSidebar" aria-label="Toggle sidebar">
          ${renderIcon("chevron")}
        </button>
      </aside>
      <section class="content">
        <div class="topbar">
          <h1 class="page-title" id="pageTitle">Home</h1>
        </div>
        <p class="subtitle" id="subtitle"></p>
        <div id="pageBody"></div>
      </section>
    </section>
  `;

  document.querySelector("#toggleSidebar").addEventListener("click", toggleSidebar);
  document.querySelector("#lockBtn").addEventListener("click", renderLogin);
  renderNav();
  selectMenu("Home");
}

function renderNav() {
  const nav = document.querySelector("#navList");
  nav.innerHTML = MENU_ITEMS.map(item => {
    return `
      <button class="nav-item" data-menu="${item}" aria-label="${item}">
        ${renderIcon(MENU_ICONS[item])}
        <span class="nav-text">${item}</span>
      </button>
    `;
  }).join("");

  nav.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => selectMenu(button.dataset.menu));
  });
}

function renderIcon(name) {
  const paths = {
    home: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z"></path>',
    pdf: '<path d="M7 3h7l4 4v14H7V3Z"></path><path d="M14 3v5h4"></path><path d="M9 13h2.2a1.4 1.4 0 0 1 0 2.8H9V13Z"></path><path d="M14 13v5"></path><path d="M14 13h2.6"></path><path d="M14 15.5h2"></path>',
    test: '<path d="M7 4h10v3H7V4Z"></path><path d="M6 6h12v15H6V6Z"></path><path d="m9 12 1.5 1.5L14 10"></path><path d="M9 17h6"></path>',
    ai: '<path d="M5 5h14v10H9l-4 4V5Z"></path><path d="M9 11h.01"></path><path d="M12 11h.01"></path><path d="M15 11h.01"></path><path d="M10 8h4"></path>',
    setting: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"></path><path d="M4 12h2"></path><path d="M18 12h2"></path><path d="M12 4v2"></path><path d="M12 18v2"></path><path d="m6.3 6.3 1.4 1.4"></path><path d="m16.3 16.3 1.4 1.4"></path><path d="m17.7 6.3-1.4 1.4"></path><path d="m7.7 16.3-1.4 1.4"></path>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path><path d="M12 14v2"></path>',
    chevron: '<path d="m9 6 6 6-6 6"></path>',
    check: '<path d="m5 12 4 4L19 6"></path>'
  };

  return `
    <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      ${paths[name]}
    </svg>
  `;
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  document.querySelector("#dashboard").classList.toggle("sidebar-closed", !state.sidebarOpen);
  document.querySelector("#sideBrand").textContent = state.sidebarOpen ? "Exam-AI" : "EA";
  renderNav();
  updateActiveNav();
}

function selectMenu(menu) {
  state.activeMenu = menu;
  document.querySelector("#pageTitle").textContent = menu;
  document.querySelector("#subtitle").textContent = getSubtitle(menu);
  updateActiveNav();

  if (menu === "Home") {
    renderHome();
    return;
  }

  if (menu === "Study AI") {
    renderStudyAI();
    openTopicModal();
    return;
  }

  renderSection(menu);
}

function updateActiveNav() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.menu === state.activeMenu);
  });
}

function getSubtitle(menu) {
  return {
    Home: "Welcome back, Rakesh. Your Exam-AI workspace is ready.",
    PDFs: "Manage study PDFs and uploaded exam material.",
    Test: "Create and review tests for your students.",
    "Study AI": "Use AI support for focused study and exam preparation.",
    Setting: "Control application preferences and access."
  }[menu];
}

function renderHome() {
  document.querySelector("#pageBody").innerHTML = `
    <section class="stats-grid">
      ${renderStat("Active Exams", "12", "#0c6b8f")}
      ${renderStat("Registered Students", "480", "#2257a0")}
      ${renderStat("Reports Generated", "96", "#347264")}
    </section>
    <section class="panel">
      <h3>Today</h3>
      <div class="task">Prepare question bank for upcoming assessments</div>
      <div class="task">Review student performance analytics</div>
      <div class="task">Publish reports from completed exams</div>
    </section>
  `;
}

function renderStat(label, value, color) {
  return `
    <article class="card">
      <div class="card-accent" style="background:${color}"></div>
      <div class="card-body">
        <div class="card-label">${label}</div>
        <div class="card-value">${value}</div>
      </div>
    </article>
  `;
}

function renderSection(menu) {
  const data = {
    PDFs: ["PDF Library", "Upload, organize, and prepare study PDFs for Exam-AI workflows.", ["Upload PDF", "Recent PDFs", "Study Material"]],
    Test: ["Test Center", "Create question sets, schedule exams, and review submitted tests.", ["Create Test", "Question Bank", "Result Review"]],
    "Study AI": ["Study AI", "AI assisted study support for notes, revision, and exam preparation.", ["Ask Study AI", "Generate Notes", "Practice Questions"]],
    Setting: ["Settings", "Manage app preferences, access control, and account details.", ["Profile", "Security", "Application"]]
  };
  const [title, detail, actions] = data[menu];

  document.querySelector("#pageBody").innerHTML = `
    <section class="panel">
      <h3>${title}</h3>
      <p>${detail}</p>
      <div class="action-row">
        ${actions.map(action => `<button class="btn">${action}</button>`).join("")}
      </div>
      <p>${menu} workspace is ready.</p>
    </section>
  `;
}

async function loadStudyTopics() {
  if (state.studyTopics.length) {
    return state.studyTopics;
  }

  try {
    const response = await fetch("./study-topics.json");
    if (!response.ok) {
      throw new Error("Topic file could not be loaded.");
    }
    state.studyTopics = await response.json();
  } catch (_error) {
    state.studyTopics = [
      {
        id: "polity",
        name: "Indian Polity",
        question: "Discuss the significance of the basic structure doctrine in preserving constitutional democracy in India."
      },
      {
        id: "economy",
        name: "Indian Economy",
        question: "Examine the role of inclusive growth in reducing poverty and regional inequality in India."
      },
      {
        id: "environment",
        name: "Environment",
        question: "Analyse the challenges India faces in balancing economic development with environmental conservation."
      }
    ];
  }

  return state.studyTopics;
}

function renderStudyAI() {
  document.querySelector("#pageBody").innerHTML = `
    <section class="study-layout">
      <article class="study-question-panel">
        <div class="section-kicker">UPSC Practice</div>
        <h3 id="studyTopicTitle">Select a topic to start</h3>
        <p id="studyQuestionText">Choose one topic from the Study AI popup. A UPSC syllabus based question will appear here.</p>
        <button class="btn" id="changeTopicBtn">Change Topic</button>
      </article>

      <article class="answer-panel">
        <label for="answerInput">Write your answer</label>
        <div class="answer-shell">
          <textarea id="answerInput" placeholder="Write a structured UPSC answer here..."></textarea>
          <button class="submit-answer" id="submitAnswerBtn" aria-label="Check answer">
            ${renderIcon("check")}
          </button>
        </div>
        <div id="evaluationResult" class="evaluation empty">
          Select a topic and submit your answer to see correctness, mistakes, and improvement points.
        </div>
      </article>
    </section>
  `;

  document.querySelector("#changeTopicBtn").addEventListener("click", openTopicModal);
  document.querySelector("#submitAnswerBtn").addEventListener("click", submitStudyAnswer);
}

async function openTopicModal() {
  const topics = await loadStudyTopics();
  const existingModal = document.querySelector("#topicModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.id = "topicModal";
  modal.innerHTML = `
    <section class="topic-modal" role="dialog" aria-modal="true" aria-labelledby="topicModalTitle">
      <div class="modal-head">
        <div>
          <div class="section-kicker">Study AI</div>
          <h3 id="topicModalTitle">Select topic to study</h3>
        </div>
        <button class="modal-close" id="closeTopicModal" aria-label="Close">×</button>
      </div>
      <div class="topic-grid">
        ${topics.map(topic => `
          <button class="topic-option" data-topic-id="${topic.id}">
            <span>${topic.name}</span>
            ${renderIcon("chevron")}
          </button>
        `).join("")}
      </div>
    </section>
  `;

  document.body.appendChild(modal);
  document.querySelector("#closeTopicModal").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.remove();
    }
  });
  modal.querySelectorAll(".topic-option").forEach(button => {
    button.addEventListener("click", () => {
      const topic = topics.find(item => item.id === button.dataset.topicId);
      selectStudyTopic(topic);
      modal.remove();
    });
  });
}

function selectStudyTopic(topic) {
  state.selectedStudyTopic = topic;
  document.querySelector("#studyTopicTitle").textContent = topic.name;
  document.querySelector("#studyQuestionText").textContent = topic.question;
  document.querySelector("#answerInput").value = "";
  document.querySelector("#evaluationResult").className = "evaluation empty";
  document.querySelector("#evaluationResult").textContent = "Write your answer and click the tick button to evaluate.";
}

async function submitStudyAnswer() {
  const answer = document.querySelector("#answerInput").value.trim();
  const resultBox = document.querySelector("#evaluationResult");

  if (!state.selectedStudyTopic) {
    resultBox.className = "evaluation error";
    resultBox.textContent = "Please select a topic first.";
    openTopicModal();
    return;
  }

  if (answer.length < 80) {
    resultBox.className = "evaluation error";
    resultBox.textContent = "Write a fuller answer before checking. Aim for an introduction, body, examples, and conclusion.";
    return;
  }

  resultBox.className = "evaluation loading";
  resultBox.textContent = "Checking answer...";

  try {
    const evaluation = await evaluateAnswerWithAI(state.selectedStudyTopic, answer);
    renderEvaluation(evaluation);
  } catch (error) {
    resultBox.className = "evaluation error";
    resultBox.textContent = error.message || "Study AI evaluation failed.";
  }
}

async function evaluateAnswerWithAI(topic, answer) {
  if (!window.examAI?.evaluateStudyAnswer) {
    throw new Error("Study AI bridge is not available.");
  }

  return window.examAI.evaluateStudyAnswer({ topic, answer });
}

function renderEvaluation(evaluation) {
  document.querySelector("#evaluationResult").className = "evaluation";
  document.querySelector("#evaluationResult").innerHTML = `
    <div class="evaluation-grid">
      <div class="feedback-card good">
        <h4>Correct</h4>
        ${evaluation.correct.map(item => `<p>${item}</p>`).join("")}
      </div>
      <div class="feedback-card bad">
        <h4>Wrong / Missing</h4>
        ${evaluation.wrong.map(item => `<p>${item}</p>`).join("")}
      </div>
      <div class="feedback-card improve">
        <h4>Improve</h4>
        ${evaluation.improve.map(item => `<p>${item}</p>`).join("")}
      </div>
    </div>
  `;
}

document.addEventListener("keydown", event => {
  if (state.screen !== "login") {
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    state.pin = state.pin.slice(0, -1);
    updatePin();
    return;
  }

  if (event.key === "Enter") {
    submitPin();
    return;
  }

  if (/^\d$/.test(event.key) && state.pin.length < 6) {
    state.pin += event.key;
    updatePin();
    if (state.pin.length === 6) {
      submitPin();
    }
  }
});

renderLogin();
