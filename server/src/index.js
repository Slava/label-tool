const express = require("express");
const sqlite = require("sqlite");

const path = require("path");

const projects = require("./queries/projects");

const app = express();

async function start() {
  const db = await sqlite.open("./database.sqlite");
  await db.migrate();

  app.get("/api/projects", async (req, res) => {
    res.json(await projects.getAll(db));
  });

  app.post("/api/projects", async (req, res) => {
    res.json(await projects.create(db));
  });

  app.get("/api/projects/:id", async (req, res) => {
    res.json(await projects.get(db, req.params.id));
  });

  app.get("/uploads/:projectId/:imageName", (req, res) => {
    const { projectId, imageName } = req.params;
    res.sendFile(
      path.join(
        __dirname + "/../uploads/",
        projectId,
        path.join("/", imageName)
      )
    );
  });
}

start();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api/")) return next();
    if (req.url.startsWith("/uploads/")) return next();
    res.sendFile(path.join(__dirname + "/../client/build/index.html"));
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
