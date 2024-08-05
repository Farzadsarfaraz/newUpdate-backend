const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { stringify } = require('querystring');
const { type } = require('os');
const { error } = require('console');
const { emit } = require('process');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



app.use(express.json());  // we get the data automatically json
app.use(cors());  // we connect our project with the port

mongoose.connect("mongodb+srv://greatstackdev:Q3TjrIDYIWwGoEOC@cluster0.5jshndl.mongodb.net/e-commerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// API creation

app.get("/", (req, res) => {
    res.send("Express App is running");
});

// Image storage Engine to store data in upload folder 

const storage = multer.diskStorage({
    destination: './upload/images',  // here we give the direction of the folder we want to save the data in
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Creating Upload endpoint for images
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {  // the field name product
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`  // all the photos saved in images
    });
});

// Schema for Creating product

const Product = mongoose.model("Product", {   // Product is the name of the Schema and for Product we define product model
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

app.post('/addproduct', async (req, res) => { // we use our Schema here
    try {
        let products = await Product.find({});  // with this we can get all the products in one array
        let id;
        if (products.length > 0) {
            let last_product_array = products.slice(-1);
            let last_product = last_product_array[0];
            id = last_product.id + 1;
        } else {
            id = 1;
        }
        const newProduct = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price
        });
        console.log(newProduct);
        await newProduct.save();
        console.log("Saved");
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Error adding product" });
    }
});

// Creating API for deleting a product

app.post('/removeproduct', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.body.id });
        if (product) {
            console.log("Removed");
            res.json({
                success: true,
                name: req.body.name
            });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, message: "Error removing product" });
    }
});

// Creating API for getting all Products;

app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All products fetched");
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

// Schema creating for user Model
const Users = mongoose.model('Users',{
    name:{
        type: String,
    },
    email:{
        type: String,
        unique: true,  // when someone make a profile with one Email id so he can not do it again.
    },
    password:{
        type: String, 
    },
    cartData:{
        type: Object,
    },
    date:{
        type: Date,
        default:Date.now,
    }
})

// Creating Endpoint for registration the user

app.post('/signup', async(req, res)=>{

    let check = await Users.findOne({email:req.body.email}) // If any email is already there we get to check
    if(check){
        res.status(400).json({success:false,errors:"Existing email found"})
    }
    let cart ={};
    
    for(let i = 0; i< 300; i++){
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save()// Save the Data on Database
    const data ={
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

// Creating endpoint for user login
app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"})
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"})
    }

})


app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on " + port);
    } else {
        console.log("Error: " + error);
    }
});