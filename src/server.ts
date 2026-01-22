import "./config/bootstrap";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import leadsRouter from "./routes/leads";

dotenv.config();

const app = express();

app.use(helmet());
// app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(cors());
app.use(express.json());

app.use(
    rateLimit({
        windowMs: 60_000, // 1 min
        limit: 20,        // 20 req/min por IP
    })
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/leads", leadsRouter);

const port = Number(process.env.PORT ?? 3333);
app.listen(port, () => console.log(`tmr-backend on http://localhost:${port}`));