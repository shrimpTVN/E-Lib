import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load env from the backend root, regardless of where the process starts.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/E-Lib",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "",
  },
};

export default config;
