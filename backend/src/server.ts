import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.clear();

  console.log("================================");
  console.log("🚀 Jarvis Backend Running");
  console.log(`🌐 http://localhost:${env.PORT}`);
  console.log("================================");
});