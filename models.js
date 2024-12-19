import mongoose from 'mongoose';

// User Model
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password : {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);


//Product model 
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image :{
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);


// Cart model
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);


// Order model
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

export { User, Product, Cart, Order };


