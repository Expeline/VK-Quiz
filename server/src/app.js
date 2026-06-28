import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const clientDistPath = path.resolve(__dirname, "../../client/dist");

/*app.use(
    cors({
        origin(origin, callback) {
            if (!origin || env.allowedClientOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    }),
);*/

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use(routes);

// app.use(express.static(clientDistPath));
// app.get(/^(?!\/api|\/health|\/uploads|\/socket\.io).*/, (_request, response) => {
//     response.sendFile(path.join(clientDistPath, "index.html"));
// });

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
