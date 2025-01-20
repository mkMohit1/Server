const ProductAdmin = require('../models/productAdmin-model');
const Product = require('../models/Product-model');
const User = require('../models/User');
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
          //console.log("dsdsfbsdfsdfsddfh",allProduct);
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

// Add this in your product controller
const validateCart = async (req, res) => {
  const { cartItems } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "No items in the cart" });
  }

  const validatedItems = [];
  const errors = [];

  for (const item of cartItems) {
    const product = await Product.findById(item._id);
    if (!product) {
      errors.push({ productId: item._id, reason: "Product not found" });
      continue;
    }

    if (product.inventory <= 0) {
      errors.push({ productId: item._id, reason: "Out of stock" });
      continue;
    }

    if (product.status !== "Active") {
      errors.push({ productId: item._id, reason: "Inactive product" });
      continue;
    }

    validatedItems.push(item);
  }

  res.json({ validatedItems, errors });
};


const syncCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;
    console.log("Sync Cart Request:", req.body);

    // Fetch user and populate cart
    const user = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product',
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Existing User Cart:", user.cart);

    // Merge cart items
    const mergedCart = user.cart.length>0?[...user.cart]:[];
    let i=0;
    for (let newItem of cartItems) {
      console.log("Processing New Item:", mergedCart[i].productId);
      const existingItem =mergedCart.length>0? mergedCart.find(
        (item) => item.productId?(item.productId._id.toString() == newItem._id):(item._id == newItem._id)
      ):null;
      if (existingItem) {
        existingItem.quantity += newItem.rentquantity; // Update quantity
      } else {
        mergedCart.push({
          productId: newItem._id, // Use new item product ID
          quantity: newItem.rentQuantity, // Use new item rent quantity
          addedAt: newItem.addedAt, // Use new item addedAt timestamp
        });
      }
      i++;
    }

    console.log("Merged Cart:", mergedCart);

    // Assign merged cart back to the user
    user.cart = mergedCart.map((item) => ({
      productId: item.productId._id || item.productId, // Ensure productId is stored as an ID
      quantity: item.quantity,
      addedAt: item.addedAt || new Date(),
    }));

    user.$__.version = undefined; // Disable version check
    // Save the updated user cart
    await user.save();

    // Re-populate the cart after saving
    const updatedUser = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product',
    });

    res.json({ message: "Cart synced successfully", cart: updatedUser.cart });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ message: `Error syncing cart: ${error.message}` });
  }
};


module.exports = { addProduct, deleteProduct, fetchProduct, fetchAllProduct, updateProduct, validateCart, syncCart };
