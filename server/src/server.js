import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";

const server = http.createServer(app);

initializeSocket(server);

server.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
});
