import { Router } from "express";
import { logger } from "../logger/index.js";

const router = Router();

const todos: any[] = [];

router.post("/", (req, res) => {
  const todo = {
    id: Date.now(),
    title: req.body.title,
  };

  todos.push(todo);

  logger.info(
    {
      todoId: todo.id,
      title: todo.title,
    },
    "Todo created",
  );

  res.status(201).json(todo);
});

router.get("/", (_req, res) => {
  logger.info(
    {
      count: todos.length,
    },
    "Todos fetched",
  );

  res.json(todos);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  logger.info(
    {
      todoId: id,
    },
    "Todo deleted",
  );

  res.sendStatus(204);
});

router.get("/test-levels", (_req, res) => {
  logger.trace("TRACE LOG");
  logger.debug("DEBUG LOG");
  logger.info("INFO LOG");
  logger.warn("WARN LOG");
  logger.error("ERROR LOG");

  res.json({
    message: "logs generated",
  });
});

router.get("/error", () => {
  throw new Error("man made error ");
});

router.get("/validation-error", () => {
  const error = new Error("Title is required");

  error.name = "ValidationError";

  throw error;
});

export default router;
