import "dotenv/config";
import app from "./app.js";
import config from "./app/config/index.js";
// import MongoDB from "./app/utils/mongodb.util.js";
import mongoose from "mongoose";
import cron from "node-cron";
import * as LoanService from "./app/service/loan.service.js";

// define a method that will run up node server with mongodb server
async function startServer() {
  try {
    // using await to make sure the database will be connected before node server run
    await mongoose.connect(config.db.url);
    console.log("Connected to the database!");

    const PORT = config.app.port;
    // define the port of node server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Cannot connect to the database!", error);
    process.exit();
  }

  cron.schedule(
    "0 0 * * *",
    async () => {
      await LoanService.processDailyPenalties();
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh", // Crucial: Ensure it runs at local midnight!
    },
  );
}
// Run server immediately => connect to DB and config server port
startServer();
