import { app } from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, "0.0.0.0", () => console.log(`API running on :${port}`));