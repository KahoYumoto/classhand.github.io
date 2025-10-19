import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path"; // pathモジュールを追加

// 環境変数 (dotenv) の読み込みはローカル開発用です
// HerokuやRenderなどの本番環境では、プラットフォーム側で環境変数を設定してください
dotenv.config();

const app = express();
// Herokuなどが割り当てるポート番号(PORT)を使用し、未設定の場合は3000を使用
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ----------------------------------------------------
// 【変更点 1】 静的ファイルのパス修正
// ----------------------------------------------------
// 'public'フォルダを静的ファイルとして提供します。
// 'public'フォルダの絶対パスを取得
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// 【変更点 2】 ルートパス (/) へのアクセス時に index.html を提供
// これがないと、サーバーが立ち上がっても '/' にアクセスした際にファイルが見つからない場合があります
app.get('/', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index.html'));
});
// ----------------------------------------------------


// 授業ごとのWebhookマッピング
// 環境変数はプラットフォーム上で設定してください (例: Heroku Config Vars)
const webhookMap = {
  webp: process.env.WEBP_WEBHOOK
};

// 挙手API
app.post("/api/raise-hand", async (req, res) => {
  const { classId, studentId, question } = req.body;
  const webhookUrl = webhookMap[classId];

  // Webhook URLの存在チェックをより厳密に
  if (!webhookUrl || webhookUrl === 'undefined') {
    console.error(`Webhook URL not found for classId: ${classId}. Check environment variable.`);
    return res.status(500).send("サーバーの設定エラーです: Webhook URLが見つかりません。");
  }

  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "新しい挙手",
    "themeColor": "0076D7",
    "title": `🙋 ${classId} 授業 挙手通知`,
    "text": `**学生番号:** ${studentId}\n**質問:** ${question}`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (response.ok) {
        res.sendStatus(200);
    } else {
        // Teams Webhookからのエラーレスポンスをログに出力
        const errorText = await response.text();
        console.error(`Teams Webhook送信失敗 (Status: ${response.status}): ${errorText}`);
        res.status(502).send("Teamsへの通知に失敗しました (Webhookエラー)");
    }
  } catch (err) {
    console.error("ネットワークまたはサーバーエラー:", err);
    res.status(500).send("サーバーエラーが発生しました");
  }
});

// ----------------------------------------------------
// 【変更点 3】 ポートの指定
// ----------------------------------------------------
app.listen(PORT, () =>
  console.log(`サーバーが ${PORT} で稼働中: http://localhost:${PORT}`)
);