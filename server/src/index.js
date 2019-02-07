const express = require("express");
const sqlite = require("sqlite");
const SQL = require("sql-template-strings");

const path = require("path");

const app = express();

async function start() {
  const db = await sqlite.open("./database.sqlite");
  await db.migrate();

  app.get("/api/jobs", async (req, res) => {
    res.json(await db.all(SQL`SELECT * FROM jobs`));
  });

  app.get("/uploads/:jobId/:imageName", (req, res) => {
    const { jobId, imageName } = req.params;
    res.sendFile(
      path.join(__dirname + "/../uploads/", jobId, path.join("/", imageName))
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
