import { logger } from "./index.js";

export const todoLogger = logger.child({
  module: "todo-service",
});
