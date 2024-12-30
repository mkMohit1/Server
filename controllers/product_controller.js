const ProductAdmin= require('../models/productAdmin-model');
const Product = require('../models/Product-model');

const fetchProduct = async (req, res) => {
    try {
        console.log('fetchProduct');
        console.log(req.params);
        const { id } = req.params;

        // Find the productAdmin by ID (without population first)
        const productAdmin = await ProductAdmin.findOne({ _id: id });

        // If the productAdmin is not found, send a 404 response
        if (!productAdmin) {
            return res.status(404).json({ message: "ProductAdmin not found" });
        }

        // If found, populate the products field
        const populatedProductAdmin = await productAdmin.populate('products');
        console.log('Populated Product Admin:', populatedProductAdmin);

        // Send the populated products as response
        res.status(200).json({ products: populatedProductAdmin.products });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

const fetchAllProduct = async (req, res) => {
    try {
        // Await the execution of the query to get the actual data
        const allProduct = await Product.find(); 

        // Check if products were found
        if (allProduct.length > 0) {
            res.status(200).json({ products: allProduct });  // Return the products
        } else {
            res.status(404).json({ message: "No products found" });  // Return a "not found" response
        }
    } catch (error) {
        // Handle the error and send a response with a message
        res.status(500).json({ message: `Error while fetching all product: ${error.message}` });
    }
};


const addProduct = async (req, res) => {
    try {
        console.log(req.body);
        const {title, slug, description, mrp, category, status, discount,userID} = req.body;
        const newProduct = new Product({title, slug, description, mrp, category, status, discount,productAdmin:userID});
        const product = await newProduct.save();
        const productAdmin = await ProductAdmin.findById(userID);
        productAdmin.products.push(product);
        await productAdmin.save();
        res.status(201).json({ message: 'Product added successfully', product });

    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

const deleteProduct = async (req, res) => {
    try {
        //console.log(req.body);
        const {products} = req.body;
        const product = await Product.findByIdAndDelete(products._id);
        console.log(product.productAdmin);
        const productAdmin = await ProductAdmin.findById(product.productAdmin);
        productAdmin.products.pull(product);
        productAdmin.save();
        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};




module.exports = {addProduct,deleteProduct , fetchProduct, fetchAllProduct};