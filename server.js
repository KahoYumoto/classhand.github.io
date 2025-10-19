import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 授業ごとのWebhookマッピング
const webhookMap = {
  webp: process.env.WEBP_WEBHOOK
};

// 挙手API
app.post("/api/raise-hand", async (req, res) => {
  const { classId, studentId, question } = req.body;
  const webhookUrl = webhookMap[classId];

  if (!webhookUrl) return res.status(400).send("無効な授業です");

  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "新しい挙手",
    "themeColor": "0076D7",
    "title": `🙋 ${classId} 授業 挙手通知`,
    "text": `**学生番号:** ${studentId}\n**質問:** ${question}`
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Teamsへの通知に失敗しました");
  }
});

app.listen(3000, "0.0.0.0", () =>
  console.log("Server running on http://0.0.0.0:3000")
);
