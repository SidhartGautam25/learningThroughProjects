import { Router } from "express";
import { logger } from "../logger/index.js";
import { audit } from "../logger/audit.js";
import { logPerformance, measureAsync } from "../logger/performance.js";

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
  const todoId = req.params.id;

  const userId = "user-45";

  audit(
    {
      action: "delete_todo",
      actorId: userId,
      targetId: todoId,
      outcome: "success",
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

router.get("/performance-test", (_req, res) => {
  logPerformance("manual_test", 125);

  res.json({
    success: true,
  });
});

router.get(
  "/slow-operation",

  async (_req, res) => {
    await measureAsync(
      "slow_db_query",

      async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      },
    );

    res.json({
      success: true,
    });
  },
);

export default router;
