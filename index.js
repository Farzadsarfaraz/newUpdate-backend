require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((err) => {
    console.error('Connection failed:', err.message);
  });

// Root endpoint
app.get("/", (req, res) => {
    res.send("Express App is running");
});

// Image Storage Configuration
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Serve static images
app.use('/images', express.static('upload/images'));

// Image Upload Endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Product Schema
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
});

// Add Product Endpoint
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        
        const newProduct = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price
        });

        await newProduct.save();
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Error adding product" });
    }
});

// Remove Product Endpoint
app.post('/removeproduct', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.body.id });
        if (product) {
            res.json({
                success: true,
                name: product.name
            });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, message: "Error removing product" });
    }
});

// Get All Products Endpoint
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

// User Schema
const Users = mongoose.model('Users', {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Object,
        default: {}
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// User Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({email: req.body.email});
        if (check) {
            return res.status(400).json({success: false, errors: "Email already exists"});
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            cartData: cart,
        });

        await user.save();

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);
        res.json({success: true, token});
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({success: false, errors: "Server error"});
    }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({email: req.body.email});
        if (!user) {
            return res.status(400).json({success: false, errors: "Invalid email or password"});
        }

        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (!passCompare) {
            return res.status(400).json({success: false, errors: "Invalid email or password"});
        }

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);
        res.json({success: true, token});
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({success: false, errors: "Server error"});
    }
});

// Start the server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on port " + port);
    } else {
        console.log("Error: " + error);
    }
});