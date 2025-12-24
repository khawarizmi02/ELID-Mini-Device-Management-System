import { createApp } from "./src/app";
import { logger } from "./src/utils";

const PORT = process.env.PORT || 3000;

const { app } = createApp();

app.listen(PORT, () => {
  logger.info(`✅ Backend server is running on http://localhost:${PORT}`);
  logger.info(`��� Database connected to: ${process.env.DATABASE_URL}`);
});
