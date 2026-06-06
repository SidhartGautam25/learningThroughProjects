import express from "express";
import todoRoutes from "./routes/todo.routes.js";
import { requestLogger } from "./middlewares/requestLogger.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use("/todos", todoRoutes);

export default app;
