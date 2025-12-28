const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

// Temporary storage (use Redis or DB in production)
const pendingCodes = {};
const linkedAccounts = {};

// Roblox sends the generated code here
app.post("/store-code", (req, res) => {
    const { code, robloxUserId } = req.body;

    if (!code || !robloxUserId) {
        return res.status(400).json({ error: "Missing fields" });
    }

    pendingCodes[code] = {
        robloxUserId,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    console.log(`Stored code ${code} for Roblox user ${robloxUserId}`);

    res.json({ success: true });
});

// Website verifies the code here
app.post("/verify-code", (req, res) => {
    const { code, websiteUserId } = req.body;

    const entry = pendingCodes[code];
    if (!entry) {
        return res.status(400).json({ error: "Invalid code" });
    }

    if (Date.now() > entry.expires) {
        delete pendingCodes[code];
        return res.status(400).json({ error: "Code expired" });
    }

    linkedAccounts[entry.robloxUserId] = websiteUserId;
    delete pendingCodes[code];

    console.log(`Linked Roblox user ${entry.robloxUserId} to website user ${websiteUserId}`);

    res.json({ success: true });
});

// Optional: check link status
app.get("/linked/:robloxUserId", (req, res) => {
    const id = req.params.robloxUserId;
    res.json({ websiteUserId: linkedAccounts[id] || null });
});

// FIXED fallback route for Express 5 (regex only)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));