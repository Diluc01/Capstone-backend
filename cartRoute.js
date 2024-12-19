import express from 'express';
import { Cart, Product } from './models.js';
import { authMiddleware as authenticateToken } from './authRoute.js';

const cartController = {
    // Add a Product to Cart
    async addToCart(req, res) {
        try {
            const { id } = req.params; // Product ID
    
            // Fetch the product to get its price
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // Find the cart or create one if it doesn't exist
            let cart = await Cart.findOne({ user: req.user._id });
            if (!cart) {
                // If no cart exists, create a new one
                cart = new Cart({
                    user: req.user._id,
                    products: []
                });
            }
    
            // Check if the product already exists in the cart
            const existingProductIndex = cart.products.findIndex(
                (cartProduct) => cartProduct.toString() === id
            );
    
          
            cart.products.push(id);
            // Save the updated cart
            await cart.save();
    
            res.status(200).json({ message: 'Product added to cart successfully', cart });
        } catch (error) {
            console.error('Error adding product to cart:', error);
            res.status(500).json({ message: 'Server error while adding product to cart' });
        }
    }
    ,

    // Remove a Product from Cart
    async removeFromCart(req, res) {
        try {
            const { id } = req.params;

            const cart = await Cart.findOne({ user: req.user._id }).populate('products');

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const index = cart.products.findIndex((product) => product._id.toString() === id);

            if (index === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            cart.products.splice(index, 1);
            await cart.save();

            res.status(200).json({ message: 'Product removed from cart successfully', cart });
        } catch (error) {
            console.error('Error removing product from cart:', error);
            res.status(500).json({ message: 'Server error while removing product from cart' });
        }
    },

    // Check Cart
    async getCart(req, res) {
        try {
            const cart = await Cart.findOne({ user: req.user._id }).populate('products');
            res.status(200).json({ cart });
        } catch (error) {
            console.error('Error fetching cart:', error);
            res.status(500).json({ message: 'Server error while fetching cart' });
        }
    },

    // Empty Cart
    async emptyCart(req, res) {
        try {
            const cart = await Cart.findOneAndDelete({ user: req.user._id });
            res.status(200).json({ message: 'Cart emptied successfully', cart });
        } catch (error) {
            console.error('Error emptying cart:', error);
            res.status(500).json({ message: 'Server error while emptying cart' });
        }
    }
}

const cartRoutes = express.Router();

cartRoutes.use(authenticateToken.authenticateToken);

cartRoutes.post('/:id', cartController.addToCart);
cartRoutes.delete('/:id', cartController.removeFromCart);
cartRoutes.get('/', cartController.getCart);
cartRoutes.delete('/', cartController.emptyCart);

export default cartRoutes;