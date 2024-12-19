
import express from 'express';
import { Product } from './models.js';
import { authMiddleware as authenticateToken } from './authRoute.js';

const productController = {
    // Add a Product
    async addProduct(req, res) {
        try {
            const { name, description, price , image } = req.body;

            const product = new Product({
                name,
                description,
                price,
                image
            });

            const savedProduct = await product.save();
            res.status(201).json({ message: 'Product added successfully', product: savedProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ message: 'Server error while adding product' });
        }
    },

    // View Products
    async getProducts(req, res) {
        try {
            const products = await Product.find();
            res.status(200).json({ products });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Server error while fetching products' });
        }
    },

    // Update a Product
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, description, price , image } = req.body;

            const product = await Product.findOne({ _id: id });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.image = image || product.image;

            const updatedProduct = await product.save();
            res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Server error while updating product' });
        }
    },

    // Delete a Product
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await Product.findOneAndDelete({ _id: id });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Server error while deleting product' });
        }
    }
}

const productRoutes = express.Router();

productRoutes.get('/', productController.getProducts);
productRoutes.post('/', authenticateToken.authenticateToken, productController.addProduct);
productRoutes.put('/:id', authenticateToken.authenticateToken, productController.updateProduct);
productRoutes.delete('/:id', authenticateToken.authenticateToken, productController.deleteProduct);    

export default productRoutes;