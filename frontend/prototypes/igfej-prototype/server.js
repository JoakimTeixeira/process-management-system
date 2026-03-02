const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 9000;
const publicDir = ".";

const server = http.createServer((req, res) => {
  // Enable CORS for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  let decodedUrl = decodeURIComponent(req.url);
  if (decodedUrl.startsWith("/")) decodedUrl = decodedUrl.slice(1);
  let filePath = path.join(
    publicDir,
    decodedUrl === "" ? "index.html" : decodedUrl,
  );

  // Get file extension to set proper content type
  const extname = path.extname(filePath);
  let contentType = "text/html";

  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(500);
        res.end("Server error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Graceful shutdown on Ctrl+C
process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});

// Handle process termination
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
