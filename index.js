const express = require("express");
const hateoas = require('express-hateoas-links');
const cors = require("cors");
const low = require("lowdb");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const produtosV1Router = require("./routes/produtosV1");
const produtosV2Router = require("./routes/produtosV2");
const PORT = process.env.PORT || 3000;
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

//db.defaults({ produtos: [] }).write();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Exemplo de API",
      version: "1.0.0",
      description: "Simples exemplo de API Rest"
    },
    servers: [
      {
        url: `http://localhost:${PORT}`
      }
    ]
  },
  apis: ["./routes/produtosV1.js"]
};
const app = express();
const specs = swaggerJsDoc(options);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(specs));
app.use(hateoas);
app.db = db;
app.use(cors());
app.use(express.json());
app.use("/v1/produtos", produtosV1Router);
app.use("/v2/produtos", produtosV2Router);
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));