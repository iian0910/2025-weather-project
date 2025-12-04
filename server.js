import express from "express"
const app = express();
const PORT = import.meta.env.PORT || 3000;

// 你要每天執行的功能
async function runDailyJob() {
  console.log("Daily job executed at:", new Date().toISOString());

  // 這裡放你要執行的 API 呼叫邏輯
  // 比如 fetch 氣象局資料、更新資料庫等
}

app.get("/tasks/daily-update", async (req, res) => {
  await runDailyJob();
  res.json({ status: "OK", executedAt: new Date().toISOString() });
});

app.listen(PORT, () => console.log("Server started on port", PORT));