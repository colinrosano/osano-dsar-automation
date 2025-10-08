const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Render provides PORT env variable

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// incoming webhook for record deletion

app.post("/new-dsar", async (req, res) => {
  console.log(req.body);

  const userEmail = req.body.details.email;

  try {
    const result = await userSearch(userEmail);
    res.status(200).json({ message: "ok", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // try {
  //   const response = await fetch(
  //     "https://xgmfvfsbojvtspztbqaf.supabase.co/rest/v1/users?email=eq." +
  //       userEmail,
  //     {
  //       method: "DELETE",
  //       headers: {
  //         apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   if (response.ok) {
  //     console.log("ok");
  //     res.status(200).json({ message: "ok" });
  //   } else {
  //     console.log("Delete failed:", response.status);
  //     res.status(500).json({ message: "Delete failed" });
  //   }
  // } catch (error) {
  //   console.log("Error:", error);
  //   res.status(500).json({ message: "Internal server error" });
  // }
});

// incoming webhook for action item update

app.post("/action-item-update", async (req, res) => {
  console.log(req.body);
  const actionItemId = req.body.details.actionItemId;

  // update osaano action iteam

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

/* when new dsar is generated:
1. webhook to send dsar details
2. webhook to send appropriate action item details
3. check db for valid email from dsar details
4. if email exists
  4a. delete from db
  4b. updated action item to COMPLETED
5. if email does not exist
  5a. update action item to REJECTED */

const userSearch = async (userEmail) => {
  const response = await fetch(
    "https://xgmfvfsbojvtspztbqaf.supabase.co/rest/v1/users?email=eq." +
      userEmail,
    {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    console.log("User found", data);
    return data;
  } else {
    throw new Error("User not found");
  }
};
