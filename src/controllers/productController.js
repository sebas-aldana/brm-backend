import { Product } from "../models/index.js";
import { sequelize } from "../models/index.js";
import { validationResult } from "express-validator";
import logger from "../utils/logger.js";

async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación al crear producto', {
        errors: errors.array(),
        body: req.body
      });
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, availableQuantity, batch } = req.body;
    
    logger.info('Creando nuevo producto', { 
      name,
      price,
      availableQuantity,
      batch 
    });

    const product = await Product.create({ ...req.body });
    
    logger.info('Producto creado exitosamente', {
      productId: product.id,
      name: product.name,
      price: product.price
    });
    
    res.status(201).json(product);
  } catch (error) {
    logger.error('Error al crear producto', {
      error: error.message,
      body: req.body,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    next(error);
  }
}

async function listProducts(req, res, next) {
  try {
    logger.debug('Obteniendo lista de productos');
    
    const products = await Product.findAll({
      order: [['name', 'ASC']]
    });
    
    logger.info(`Se encontraron ${products.length} productos`);
    
    res.json(products);
  } catch (error) {
    logger.error('Error al obtener la lista de productos', {
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    logger.debug('Buscando producto', { productId: id });
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      logger.warn('Producto no encontrado', { productId: id });
      return res.status(404).json({ 
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado' 
      });
    }
    
    logger.info('Producto encontrado', { 
      productId: product.id,
      name: product.name 
    });
    
    res.json(product);
  } catch (error) {
    logger.error('Error al obtener producto', {
      error: error.message,
      productId: req.params.id,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    logger.info('Actualizando producto', { 
      productId: id,
      updates: req.body 
    });
    
    const product = await Product.findByPk(id, { transaction });
    
    if (!product) {
      logger.warn('Producto no encontrado para actualizar', { productId: id });
      return res.status(404).json({ 
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado' 
      });
    }
    
    await product.update(req.body, { transaction });
    await transaction.commit();
    
    logger.info('Producto actualizado exitosamente', {
      productId: product.id,
      updates: req.body
    });
    
    res.json(product);
  } catch (error) {
    await transaction.rollback();
    
    logger.error('Error al actualizar producto', {
      error: error.message,
      productId: req.params.id,
      updates: req.body,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    logger.info('Eliminando producto', { productId: id });
    
    const product = await Product.findByPk(id, { transaction });
    
    if (!product) {
      logger.warn('Producto no encontrado para eliminar', { productId: id });
      return res.status(404).json({ 
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado' 
      });
    }
    
    await product.destroy({ transaction });
    await transaction.commit();
    
    logger.info('Producto eliminado exitosamente', {
      productId: id,
      name: product.name
    });
    
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    
    logger.error('Error al eliminar producto', {
      error: error.message,
      productId: req.params.id,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    
    next(error);
  }
}

export {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
