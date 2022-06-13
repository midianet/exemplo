const { query } = require("express");
const express = require("express");
const _ = require('lodash');
const router = express.Router();
const { v4: uuid } = require('uuid');

const buildLinks = function(id,props){
	const baseUrl = "/v2/produtos";
	let links     = [];
	if(props.includes('isSelf'))  links.push({rel:"self",method:"GET",href:`${baseUrl}/${id}`});
	if(props.includes('isCreate')) links.push({rel:"create",method:"POST",title:"Cria um produto",href:baseUrl});
	if(props.includes('isUpdate')) links.push({rel:"update",method:"PUT",title:"Altera um produto",href:`${baseUrl}/${id}`});
	if(props.includes('isDelete')) links.push({rel:"delete",method:"DELETE",title:"Remove um produto",href:`${baseUrl}/${id}`});
	return links;
}

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
 *         imposto: 15.23
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
 * /v2/produtos:
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
	const produtos = _.toArray(req.app.db.get("produtos"))
	if(req.query.hateoas){
		produtos.forEach(produto => produto.links = buildLinks(produto.id,['isSelf','isUpdate','isDelete'])); 	
	}
	res.send(produtos);
});

/**
 * @swagger
 * /v2/produtos/{id}:
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
  const produto = req.app.db.get("produtos").find({ id: req.params.id }).value();
  if(produto){
	if(req.query.hateoas){
		produto.links = buildLinks(produto.id,['isSelf','isUpdate','isDelete'])
	}
	res.send(produto);    
  }else{
	res.sendStatus(404)
  }
});

/**
 * @swagger
 * /v2/produtos:
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
		const produto = {
			id: uuid(),
			...req.body,
		};
    	req.app.db.get("produtos").push(produto).write();
    	res.status(201)
		if(req.query.hateoas){
			buildLinks(produto.id,['isSelf','isUpdate','isDelete'])
		}
    	res.send(produto)
	} catch (error) {
		return res.status(500).send(error);
	}
});

/**
 * @swagger
 * /v2/produtos/{id}:
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
		const produto =  req.app.db.get("produtos").find({ id: req.params.id })
		if(req.query.hateoas){
			buildLinks(produto.id,['isSelf','isUpdate','isDelete'])
		}		
		res.send(produto);
	} catch (error) {
		return res.status(500).send(error);
	}
});

/**
 * @swagger
 * /v2/produtos/{id}:
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
