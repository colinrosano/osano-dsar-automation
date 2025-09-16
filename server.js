const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Render provides PORT env variable

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

// incoming webhook for record deletion

app.post("/data-deletion", async (req, res) => {
  console.log(req.body);

  const userEmail = req.body.details.email;

  try {
    const response = await fetch(
      "https://xgmfvfsbojvtspztbqaf.supabase.co/rest/v1/users?email=eq." +
        userEmail,
      {
        method: "DELETE",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
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

// incoming webhook for action item update

app.post("/action-item-update", async (req, res) => {
  console.log(req.body);
  const actionItemId = req.body.details.actionItemId;

  try {
    const response = await fetch(
      "https://api.osano.com/v1/subject-rights/action-items/" + actionItemId,
      {
        method: "PATCH",
        headers: {
          "x-osano-api-key": process.env.X_OSANO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      }
    );
    if (response.ok) {
      console.log("action item updated");
      res.status(200).json({ message: "ok" });
    } else {
      console.log("update failed", response.status);
      res.status(500).json({ message: "Failed to update action item" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// function to Update Osano action item

// check supabase for customer record
