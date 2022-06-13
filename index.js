const express = require("express");
const cors = require("cors");
//const morgan = require("morgan");
const low = require("lowdb");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const produtosRouter = require("./routes/produtos");
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
  apis: ["./routes/*.js"]
};
const app = express();
const specs = swaggerJsDoc(options);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(specs));
app.db = db;
app.use(cors());
app.use(express.json());
//app.use(morgan("dev"));
app.use("/produtos", produtosRouter);
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));