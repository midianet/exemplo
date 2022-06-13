const express = require("express");
const router = express.Router();
const { v4: uuid } = require('uuid');

/**
 * @swagger
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       required:
 *         - nome
 *         - valor
 *       properties:
 *         id:
 *           type: string
 *           description: Código gerado automaticamente para o produto
 *         nome:
 *           type: string
 *           description: Nome descritivo do produto
 *         valor:
 *           type: double
 *           description: Valor de venda do produto
 *       example:
 *         id: d5fE_asz
 *         nome: Novo Sapato 
 *         valor: 123.45
 */

 /**
  * @swagger
  * tags:
  *   name: Produtos
  *   description: API de gerenciamento de produtos
  */

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Retorna a lista com todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: A lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 */
router.get("/", (req, res) => {
	const books = req.app.db.get("produtos");
	res.send(books);
});

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Retorna o produto por id
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id do produto
 *     responses:
 *       200:
 *         description: Produto retornado com sucesso
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Ocorreu algum erro
 */
router.get("/:id", (req, res) => {
  const book = req.app.db.get("produtos").find({ id: req.params.id }).value();
  if(!book){
    res.sendStatus(404)
  }
  res.send(book);
});

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       500:
 *         description: Ocorreu algum erro
 */
router.post("/", (req, res) => {
	try {
		const book = {
			id: uuid(),
			...req.body,
		};
    	req.app.db.get("produtos").push(book).write();
    	res.status(201)
    	res.send(book)
	} catch (error) {
		return res.status(500).send(error);
	}
});

/**
 * @swagger
 * /produtos/{id}:
 *  put:
 *    summary: Atualiza o produto por id
 *    tags: [Produtos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Id do produto
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Produto'
 *    responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Ocorreu algum erro
 */
router.put("/:id", (req, res) => {
	try {
		req.app.db
			.get("produtos")
			.find({ id: req.params.id })
			.assign(req.body)
			.write();
		res.send(req.app.db.get("books").find({ id: req.params.id }));
	} catch (error) {
		return res.status(500).send(error);
	}
});

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Remove o produto por id
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id do produto
 * 
 *     responses:
 *       204:
 *         description: O produto foi removido com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Ocorreu algum erro
 */
router.delete("/:id", (req, res) => {
	req.app.db.get("produtos").remove({ id: req.params.id }).write();
	res.sendStatus(204);
});

module.exports = router;
