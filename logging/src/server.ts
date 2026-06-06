import { logger } from "./logger/index.js";
import app from "./app.js";

const PORT = 3000;

app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
    },
    "Server started",
  );
});
