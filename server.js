const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.json());

// In-memory store (use Redis or a database in production)
const pendingCodes = {};  
const linkedAccounts = {}; 

// Generate a code for a website user
app.post("/generate-code", (req, res) => {
    const { websiteUserId } = req.body;

    if (!websiteUserId) {
        return res.status(400).json({ error: "Missing websiteUserId" });
    }

    const code = crypto.randomBytes(3).toString("hex"); // 6-char code
    pendingCodes[code] = {
        websiteUserId,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    res.json({ code });
});

// Roblox verifies the code
app.post("/verify-code", (req, res) => {
    const { code, robloxUserId } = req.body;

    const entry = pendingCodes[code];
    if (!entry) {
        return res.status(400).json({ error: "Invalid code" });
    }

    if (Date.now() > entry.expires) {
        delete pendingCodes[code];
        return res.status(400).json({ error: "Code expired" });
    }

    linkedAccounts[robloxUserId] = entry.websiteUserId;
    delete pendingCodes[code];

    res.json({ success: true });
});

// Check linked account
app.get("/linked/:robloxUserId", (req, res) => {
    const id = req.params.robloxUserId;
    res.json({ websiteUserId: linkedAccounts[id] || null });
});

app.listen(3000, () => console.log("Server running"));