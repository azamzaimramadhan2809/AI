import express from "express";
import cors from "cors";
import chatRoutes from "@/modules/chat/chat.routes";

import routes from "./routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", routes);

app.use("/api/chat", chatRoutes);

export default app;