const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Render provides PORT env variable

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

app.post("/incoming-webhook", async (req, res) => {
  console.log(req.body);

  const userEmail = req.body.details.email;

  res.status(200).end();

  try {
    const response = await fetch(
      "https://xgmfvfsbojvtspztbqaf.supabase.co/rest/v1/users?email=eq." +
        userEmail,
      {
        method: "DELETE",
        headers: {
          apikey: "sb_secret_ImrpMRw3y8Vu1Gwyx-9Cfg_bq53Yrkv",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      console.log("ok");
      res.status(200).json({ message: "ok" });
    } else {
      console.log("Delete failed:", response.status);
      res.status(500).json({ message: "Delete failed" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
