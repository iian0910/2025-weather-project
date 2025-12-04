import cron from "node-cron"
// import fetch from "node-fetch"

cron.schedule('*/10 * * * *', async() => {
  console.log(console.log("開始執行 API 呼叫..."))
})