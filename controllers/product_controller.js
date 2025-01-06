const ProductAdmin = require('../models/productAdmin-model');
const Product = require('../models/Product-model');
const multer = require('multer');
const path = require('path');

// Multer configuration to handle file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
});

// Fetch a product based on productAdmin ID
const fetchProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productAdmin = await ProductAdmin.findOne({ _id: id });

        if (!productAdmin) {
            return res.status(404).json({ message: "ProductAdmin not found" });
        }

        const populatedProductAdmin = await productAdmin.populate('products');
        res.status(200).json({ products: populatedProductAdmin.products });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// Fetch all products
const fetchAllProduct = async (req, res) => {
    try {
        const allProduct = await Product.find();

        if (allProduct.length > 0) {
            res.status(200).json({ products: allProduct });
        } else {
            res.status(404).json({ message: "No products found" });
        }
    } catch (error) {
        res.status(500).json({ message: `Error while fetching products: ${error.message}` });
    }
};

// Add a new product
const addProduct = async (req, res) => {
   console.log("Body:", req.body);
    // console.log("File:", req.file);
    try {
        const { title, subTitle, description, mrp,inventory,productUsp, category, status, discount, userID } = req.body;

        // Validate required fields
        if (!title || !subTitle || !inventory || !productUsp || !description || !mrp || !category || !status || !discount || !userID) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Handle image file upload
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        let imagePath = null;
        if (req.file) {
            imagePath = `\\${req.file.path}`;
        }
        //console.log("new",imagePath);
        const newProduct = new Product({
            title, 
            subTitle, 
            description, 
            mrp,
            inventory,
            productUsp, 
            category, 
            status, 
            discount, 
            productAdmin: userID, 
            productImage: imagePath,
            rentQuantity:1,
            saleQuantity: 1,
        });

        const product = await newProduct.save();
        const productAdmin = await ProductAdmin.findById(userID);
        productAdmin.products.push(product);
        await productAdmin.save();

        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const productAdmin = await ProductAdmin.findById(product.productAdmin);
        if (!productAdmin) {
            return res.status(404).json({ message: "ProductAdmin not found" });
        }
        productAdmin.products.pull(product);
        await productAdmin.save();

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// update a Product

const updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
  
      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }
  
      const updatedData = { ...req.body };
      if (imagePath) {
        updatedData.productImage = imagePath;
      }
  
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      return res.status(200).json({
        message: 'Successfully updated the product',
        product: updatedProduct
      });
    } catch (error) {
      return res.status(500).json({ message: `Error while updating the product: ${error.message}` });
    }
  };
  

module.exports = { addProduct, deleteProduct, fetchProduct, fetchAllProduct, updateProduct };
