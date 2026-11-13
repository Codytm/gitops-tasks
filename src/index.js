const express = require("express");

function createApp() {
  const app = express();
  app.use(express.json());

  const tasks = [];
  let nextId = 1;

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "tasks-api",
      release: "gitops",
      version: process.env.APP_VERSION || "dev",
    });
  });

  app.get("/api/tasks", (_req, res) => {
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const title = req.body && req.body.title;
    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const task = { id: nextId, title: title.trim(), done: false };
    nextId += 1;
    tasks.push(task);
    res.status(201).json(task);
  });

  return app;
}

function listen(port = process.env.PORT || 3000) {
  const app = createApp();
  return app.listen(port);
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  listen(port);
  console.log(`tasks-api listening on ${port}`);
}

module.exports = { createApp, listen };
