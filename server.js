const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Render provides PORT env variable

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

app.post("/incoming-webhook", (req, res) => {
  console.log({req.body})

  res.status(200).json({ message: "Webhook received successfully" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
