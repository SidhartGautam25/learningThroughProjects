import { Router, type Request } from "express";
import { logger } from "../logger/index.js";
import { audit } from "../logger/audit.js";
import { logPerformance, measureAsync } from "../logger/performance.js";
import { trace } from "@opentelemetry/api";
import { tracer } from "../telemetry/tracer.js";

const router = Router();

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const todos: Todo[] = [];

function getActor(req: Request) {
  const actorId = req.header("x-user-id") ?? "anonymous";

  return {
    id: actorId,
    type: actorId === "anonymous" ? "anonymous" : "user",
  };
}

// post route for version 1 , means before implementing openTelemetry
// router.post("/", (req, res) => {
//   // const todo = {
//   //   id: Date.now(),
//   //   title: req.body.title,
//   //   completed: false,
//   // };
//   // const actor = getActor(req);

//   // todos.push(todo);

//   // logger.info(
//   //   {
//   //     event: {
//   //       category: "application",
//   //       action: "create_todo",
//   //       outcome: "success",
//   //     },
//   //     actor,
//   //     resource: {
//   //       type: "todo",
//   //       id: String(todo.id),
//   //     },
//   //   },
//   //   "Todo created",
//   // );

//   // res.status(201).json(todo);

// });

router.post("/", async (req, res) => {
  const tracer = trace.getTracer("todo-api");

  await tracer.startActiveSpan(
    "create_todo",

    async (span) => {
      try {
        const todo = {
          id: Date.now(),
          title: req.body.title,
        };

        logger.info(
          {
            resource: {
              type: "todo",
              id: todo.id,
            },
          },
          "Todo created",
        );

        res.status(201).json(todo);
      } finally {
        span.end();
      }
    },
  );
});

router.get("/", (_req, res) => {
  console.log("base route");
  logger.info(
    {
      event: {
        category: "application",
        action: "list_todos",
        outcome: "success",
      },
      resource: {
        type: "todo_collection",
        count: todos.length,
      },
    },
    "Todos fetched",
  );

  res.json(todos);
});

router.get("/otel-test", (_req, res) => {
  const span = trace.getActiveSpan();
  res.json({
    success: true,
  });
});

router.get(
  "/manual-span",

  async (_req, res) => {
    await tracer.startActiveSpan(
      "fake_database_query",

      async (span) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
        } finally {
          span.end();
        }
      },
    );

    res.json({
      success: true,
    });
  },
);

// curl http://localhost:3000/todos/test-levels
router.get("/test-levels", (_req, res) => {
  logger.trace({
    event: {
      category: "application",
      action: "test_trace_log",
      outcome: "success",
    },
  });
  logger.debug({
    event: {
      category: "application",
      action: "test_debug_log",
      outcome: "success",
    },
  });
  logger.info({
    event: {
      category: "application",
      action: "test_info_log",
      outcome: "success",
    },
  });
  logger.warn({
    event: {
      category: "application",
      action: "test_warn_log",
      outcome: "success",
    },
  });
  logger.error({
    event: {
      category: "application",
      action: "test_error_log",
      outcome: "failure",
    },
  });

  res.json({
    message: "logs generated",
  });
});

// curl http://localhost:3000/todos/error
router.get("/error", () => {
  throw new Error("man made error ");
});

// curl http://localhost:3000/todos/validation-error
router.get("/validation-error", () => {
  const error = new Error("Title is required");

  error.name = "ValidationError";

  throw error;
});

// curl http://localhost:3000/todos/performance-test
router.get("/performance-test", (_req, res) => {
  logPerformance("manual_test", 125);

  res.json({
    success: true,
  });
});

// curl http://localhost:3000/todos/slow-operation
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

// curl http://localhost:3000/todos/performance-error
router.get("/performance-error", async (_req, res) => {
  await measureAsync("failing_db_query", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    throw new Error("Simulated database timeout");
  });

  res.json({
    success: true,
  });
});

// curl http://localhost:3000/todos/123
router.get("/:id", (req, res) => {
  const todoId = req.params.id;
  const todo = todos.find((item) => String(item.id) === todoId);

  logger.info(
    {
      event: {
        category: "application",
        action: "get_todo",
        outcome: todo ? "success" : "failure",
      },
      resource: {
        type: "todo",
        id: todoId,
      },
    },
    "Todo fetched",
  );

  if (!todo) {
    res.status(404).json({
      message: "todo not found",
    });
    return;
  }

  res.json(todo);
});

// curl -X PUT http://localhost:3000/todos/123 -H 'Content-Type: application/json' -H 'x-user-id: user-45' -d '{"title":"Updated title"}'
router.put("/:id", (req, res) => {
  const todoId = req.params.id;
  const todo = todos.find((item) => String(item.id) === todoId);
  const actor = getActor(req);

  if (!todo) {
    audit(
      {
        action: "update_todo",
        actorId: actor.id,
        actorType: actor.type,
        resourceType: "todo",
        resourceId: todoId,
        outcome: "failure",
      },
      "Todo update failed",
    );

    res.status(404).json({
      message: "todo not found",
    });
    return;
  }

  todo.title = req.body.title ?? todo.title;

  audit(
    {
      action: "update_todo",
      actorId: actor.id,
      actorType: actor.type,
      resourceType: "todo",
      resourceId: todoId,
      outcome: "success",
    },
    "Todo updated",
  );

  res.json(todo);
});

// curl -X PATCH http://localhost:3000/todos/123/complete -H 'x-user-id: user-45'
router.patch("/:id/complete", (req, res) => {
  const todoId = req.params.id;
  const todo = todos.find((item) => String(item.id) === todoId);
  const actor = getActor(req);

  if (!todo) {
    audit(
      {
        action: "complete_todo",
        actorId: actor.id,
        actorType: actor.type,
        resourceType: "todo",
        resourceId: todoId,
        outcome: "failure",
      },
      "Todo complete failed",
    );

    res.status(404).json({
      message: "todo not found",
    });
    return;
  }

  todo.completed = true;

  audit(
    {
      action: "complete_todo",
      actorId: actor.id,
      actorType: actor.type,
      resourceType: "todo",
      resourceId: todoId,
      outcome: "success",
    },
    "Todo completed",
  );

  res.json(todo);
});

// curl -X DELETE http://localhost:3000/todos/123 -H 'x-user-id: user-45'
router.delete("/:id", (req, res) => {
  const todoId = req.params.id;
  const actor = getActor(req);
  const todoIndex = todos.findIndex((item) => String(item.id) === todoId);
  const deleted = todoIndex !== -1;

  if (deleted) {
    todos.splice(todoIndex, 1);
  }

  audit(
    {
      action: "delete_todo",
      actorId: actor.id,
      actorType: actor.type,
      resourceType: "todo",
      resourceId: todoId,
      outcome: deleted ? "success" : "failure",
    },
    deleted ? "Todo deleted" : "Todo delete failed",
  );

  if (!deleted) {
    res.status(404).json({
      message: "todo not found",
    });
    return;
  }

  res.sendStatus(204);
});

export default router;
