document.getElementById("linkForm").onsubmit = async (e) => {
    e.preventDefault();

    const code = document.getElementById("code").value;
    const websiteUserId = document.getElementById("websiteUserId").value;

    const res = await fetch("https://your-app.onrender.com/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, websiteUserId })
    });

    const data = await res.json();

    const resultBox = document.getElementById("result");

    if (data.success) {
        resultBox.style.color = "lightgreen";
        resultBox.innerText = "Account linked successfully!";
    } else {
        resultBox.style.color = "red";
        resultBox.innerText = "Error: " + (data.error || "Unknown error");
    }
};