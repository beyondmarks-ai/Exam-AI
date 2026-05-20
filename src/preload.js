const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("examAI", {
  appName: "Exam-AI",
  evaluateStudyAnswer: payload => ipcRenderer.invoke("study:evaluate", payload)
});
