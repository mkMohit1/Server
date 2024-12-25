const ProductAdmin= require('../models/productAdmin-model');
const Product = require('../models/product-model');

const fetchProduct = async (req, res) => {
    try {
        console.log('fetchProduct');
        console.log(req.params);
        const {id} = req.params;
         // Ensure ProductAdmin.findById is the correct query
         const productAdmin = await ProductAdmin.findOne({_id:id}); // Assuming 'products' is a reference field
         if(productAdmin){
            console.log(productAdmin);
            const products = await productAdmin.findById(productAdmin._id).populate('products');
            console.log(products);
         }
         console.log(products);
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
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

module.exports = {addProduct,deleteProduct , fetchProduct};