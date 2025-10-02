import fs from "node:fs";
import redisCache, { initRedis } from "@repo/cache";
import db from "@repo/db";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
import morgan from "morgan";
import client from "prom-client";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { metricsMiddleware } from "./middleware";
import router from "./routes";

dotenv.config();

export const app: Express = express();
export const port = process.env.PORT || 3001;

async function RedisStarter() {
    await initRedis();
}
RedisStarter();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(metricsMiddleware);
app.use("/api/v1", router);

const file = fs.readFileSync("../../swagger/http_spec.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", async (_req: Request, res: Response) => {
    res.status(200).send("<h1>Hello HTTP!</h1>");
});

app.get("/pid", (_req: Request, res: Response) => {
    res.send(`The process id is ${process.pid}!`);
});

app.get("/health", async (_req: Request, res: Response) => {
    try {
        await db.$queryRaw`SELECT 1`;

        const redisCheck = await redisCache.ping();

        if (redisCheck !== "PONG") {
            throw new Error("Redis not responding");
        }

        return res.status(200).json({
            message: "Server is healthy",
            status: "ok",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(503).json({
            error: (error as Error).message,
            message: "Server is unhealthy",
            status: "fail",
            timestamp: new Date().toISOString(),
        });
    }
});

app.get("/metrics", async (_req: Request, res: Response) => {
    try {
        const metrics = await client.register.metrics();
        res.set("Content-Type", client.register.contentType);
        res.end(metrics);
    } catch (_error) {
        return res.status(500).json({
            message: "Internal Server error",
        });
    }
});
