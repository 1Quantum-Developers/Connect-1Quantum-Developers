const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Temporary storage (use Redis or DB in production)
const pendingCodes = {};
const linkedAccounts = {};

// Roblox sends code here
app.post("/store-code", (req, res) => {
    const { code, robloxUserId } = req.body;

    if (!code || !robloxUserId) {
        return res.status(400).json({ error: "Missing fields" });
    }

    pendingCodes[code] = {
        robloxUserId,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    res.json({ success: true });
});

// Website verifies code here
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

    res.json({ success: true });
});

// Optional: check link status
app.get("/linked/:robloxUserId", (req, res) => {
    const id = req.params.robloxUserId;
    res.json({ websiteUserId: linkedAccounts[id] || null });
});

app.listen(3000, () => console.log("Server running on port 3000"));