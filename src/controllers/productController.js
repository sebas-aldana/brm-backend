import { Product } from "../models/index.js";
import { validationResult } from "express-validator";

async function createProduct(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const p = await Product.create({ ...req.body });
  res.status(201).json(p);
}

async function listProducts(req, res) {
  const products = await Product.findAll();
  res.json(products);
}

async function getProduct(req, res) {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
}

async function updateProduct(req, res) {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  await p.update(req.body);
  res.json(p);
}

async function deleteProduct(req, res) {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  await p.destroy();
  res.status(204).send();
}

export {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
