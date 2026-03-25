// Demo project entry point (small for token-safe uploads)
import { createServer } from "./api.js";

const app = createServer();

app.listen(3000, () => {
  console.log("Demo server running on http://localhost:3000");
});

