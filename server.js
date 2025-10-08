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
// incoming dsar webhook with conditional filtering
app.post("/new-dsar", async (req, res) => {
  console.log(req.body);
  const userEmail = req.body.details.email;
  const requestType = req.body.details.request_type;

  try {
    const result = await userSearch(userEmail);

    if (requestType === "SUMMARY") {
      // generate summary file and update item to COMPLETED
      res.status(200).json({ message: "user found, sending summary" });
    } else if (requestType === "DELETE") {
      // delete record from db, and update action item to COMPLETED
      await deleteUser(userEmail);
      res.status(200).json({ message: "user found, deleting data" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "No user data found. Rejecting action item" });
    // update action item to REJECTED
  }
});

// function to delete user
const deleteUser = async (userEmail) => {
  const response = await fetch(
    "https://xgmfvfsbojvtspztbqaf.supabase.co/rest/v1/users?email=eq." +
      userEmail,
    {
      method: "DELETE",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );

  if (response.ok) {
    console.log("user deleted");
  } else {
    throw new Error("unable to delete user");
  }
};

// function to search db
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

// incoming webhook for record deletion - OLD

// app.post("/new-dsar", async (req, res) => {
//   console.log(req.body);

//   const userEmail = req.body.details.email;

//   try {
//     const result = await userSearch(userEmail);
//     res.status(200).json({ message: "ok", result });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }

//   try {
//     const response = await fetch(
//       "https://xgmfvfsbojvtspztbqaf.supabase.co/rest/v1/users?email=eq." +
//         userEmail,
//       {
//         method: "DELETE",
//         headers: {
//           apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.ok) {
//       console.log("ok");
//       res.status(200).json({ message: "ok" });
//     } else {
//       console.log("Delete failed:", response.status);
//       res.status(500).json({ message: "Delete failed" });
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// END OLD

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
