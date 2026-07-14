import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";
import "./authRegistry";
import "./groupRegistry";

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openapiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "API de Autenticação",
    version: "1.0.0",
    description: "Boilerplate de API com cadastro, login e rotas protegidas via JWT",
  },
  servers: [
    {
      url: "http://localhost:3333",
      description: "Servidor local de desenvolvimento",
    },
  ],
});