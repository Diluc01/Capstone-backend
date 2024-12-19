import express from 'express';
import { Cart, Order } from './models.js';
import { authMiddleware as authenticateToken } from './authRoute.js';

const orderController = {
    // Add an Order
    async addOrder(req, res) {
        try {
            const cart = await Cart.findOne({ user: req.user._id }).populate('products');
            if(!cart){
                return res.status(404).json({ message: 'Cart not found' });
            }
            if(cart.products.length === 0){
                return res.status(400).json({ message: 'Cart is empty' });
            }
            const totalValue = cart.products.reduce((acc, product) => acc + product.price , 0);
            const productIds = cart.products.map(product => product._id);
            const order = new Order({
                user: req.user._id,
                totalPrice: totalValue,
                products: productIds,
                status: 'fullfilled'
            });
            await order.save();
            cart.products = [];
            await cart.save();
            res.status(201).json({ message: 'Order added successfully', order });
        } catch (error) {
            console.error('Error adding order:', error);
            res.status(500).json({ message: 'Server error while adding order' });
        }
    },

    // View Orders
    async getOrders(req, res) {
        try {
            const orders = await Order.find({ user: req.user._id }).populate('products');
            res.status(200).json({ orders });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ message: 'Server error while fetching orders' });
        }
    },
};

const orderRoutes = express.Router();

orderRoutes.post('/add', authenticateToken.authenticateToken, orderController.addOrder);
orderRoutes.get('/', authenticateToken.authenticateToken, orderController.getOrders);

export { orderRoutes };