import "./config/zodExtend";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { env } from "./config/env";
import { openapiDocument } from "./config/openapiDocument";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.get("/", (req, res) => {
  res.json({ status: "API rodando" });
});

app.use(errorMiddleware);

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});