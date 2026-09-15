import express from "express";
import { ApiError, sendApiError } from "./core/errors/api-error";
import cors from "cors";
import chatRoutes from "@/modules/chat/chat.routes";

import routes from "./routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", routes);

app.use("/api/chat", chatRoutes);

app.use((_req, res) => sendApiError(res, new ApiError(404, "Route not found")));
app.use(((error, _req, res, _next) => {
  sendApiError(res, error);
}) as express.ErrorRequestHandler);

export default app;
