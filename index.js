const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

app.use(express.json())  // we get the data automatically json
app.use(cors());  // we connect our project with the port

mongoose.connect("mongodb+srv://greatstackdev:Q3TjrIDYIWwGoEOC@cluster0.5jshndl.mongodb.net/e-commerce");

//API creation

app.get("/", (req, res)=>{
    res.send("Express App is running")

})

// Image storage Engine to store a data in upload folder

const storage = multer.diskStorage({
    destination: './upload/images',  // here we give the direction of the folder we want to save the da data
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


app.listen(port, (error)=>{
    if(!error){
        console.log("Server is running on " + port)
    }else{
        console.log("Error: " + error)
    }
})