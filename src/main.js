const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const DEFAULT_AZURE_RESPONSES_URL = "https://rakesh.openai.azure.com/openai/responses?api-version=2025-04-01-preview";

function loadEnvFile() {
  const candidates = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", ".env.txt")
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const textParts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

function parseEvaluation(text) {
  try {
    const parsed = JSON.parse(text);
    return {
      correct: Array.isArray(parsed.correct) ? parsed.correct : [],
      wrong: Array.isArray(parsed.wrong) ? parsed.wrong : [],
      improve: Array.isArray(parsed.improve) ? parsed.improve : []
    };
  } catch (_error) {
    return {
      correct: ["Azure returned feedback, but it was not valid JSON."],
      wrong: ["The response format needs to be corrected."],
      improve: [text || "No feedback text was returned."]
    };
  }
}

async function evaluateStudyAnswerWithAzure(_event, payload) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const url = process.env.AZURE_OPENAI_RESPONSES_URL || DEFAULT_AZURE_RESPONSES_URL;
  const model = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AZURE_OPENAI_MODEL || "gpt-5.1";

  if (!apiKey) {
    throw new Error("AZURE_OPENAI_API_KEY is missing in .env or .env.txt.");
  }

  const topicName = payload?.topic?.name || "UPSC topic";
  const question = payload?.topic?.question || "";
  const answer = payload?.answer || "";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are a strict but helpful UPSC mains answer evaluator. Return only valid JSON with keys correct, wrong, improve. Each value must be an array of short strings. Use green-worthy points in correct, red-worthy mistakes or missing points in wrong, and practical answer-writing advice in improve."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Topic: ${topicName}\nQuestion: ${question}\nStudent answer:\n${answer}`
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Azure request failed (${response.status}): ${details.slice(0, 500)}`);
  }

  const data = await response.json();
  return parseEvaluation(extractResponseText(data));
}

function getWindowBounds() {
  const { screen } = require("electron");
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;
  const width = Math.min(Math.max(Math.floor(screenWidth * 0.9), 1180), screenWidth);
  const height = Math.min(Math.max(Math.floor(screenHeight * 0.88), 760), screenHeight);

  return {
    width,
    height,
    x: Math.floor((screenWidth - width) / 2),
    y: Math.floor((screenHeight - height) / 2)
  };
}

function createWindow() {
  const bounds = getWindowBounds();

  const mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 920,
    minHeight: 680,
    title: "Exam-AI",
    backgroundColor: "#071421",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  loadEnvFile();
  ipcMain.handle("study:evaluate", evaluateStudyAnswerWithAzure);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
