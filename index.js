const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { type } = require('os');

app.use(express.json())  // we get the data automatically json
app.use(cors());  // we connect our project with the port

mongoose.connect("mongodb+srv://greatstackdev:Q3TjrIDYIWwGoEOC@cluster0.5jshndl.mongodb.net/e-commerce");

//API creation

app.get("/", (req, res)=>{
    res.send("Express App is running")

})

// Image storage Engine to store a data in upload folder 

const storage = multer.diskStorage({
    destination: './upload/images',  // here we give the direction of the folder we want to save the da data in
    filename:(req, file, cb) =>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)

    }
})
const upload = multer({storage: storage})

// Creating Upload endpoint for images
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'),(req, res) =>{  // the field name product
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`  // all the photo save in images
    })

})

// Schema for Creating product

const Product = mongoose.model("Product", {   // Product is the name of the Schema and for Product we define product model
    id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    new_price:{
        type:Number,
        required:true
    },
    old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct', async (req, res)=>{ // we use our Schema here
    let products = await Product.find({})  // with this we can get all the product in one array
    let id;
    if(products.length >0)
    {
        let last_product_array = product.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }else{
        id = 1
    }
    const product = new Product({
        id:id,         
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating API for deleting a product

app.post('/removeproduct', async(req, res) =>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

app.listen(port, (error)=>{
    if(!error){
        console.log("Server is running on " + port)
    }else{
        console.log("Error: " + error)
    }
})