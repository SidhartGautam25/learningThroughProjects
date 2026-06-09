import express from "express";
import todoRoutes from "./routes/todo.routes.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";
import { requestContextMiddleware } from "./middlewares/requestContext.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestContextMiddleware);
app.use(requestLogger);
app.use("/todos", todoRoutes);
app.use(errorHandler);

export default app;
