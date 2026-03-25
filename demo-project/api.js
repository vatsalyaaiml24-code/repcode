import express from "express";

export function createApi() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/users/:id", (_req, res) => {
    res.json({ id: "demo-user", name: "Demo User" });
  });

  return app;
}

