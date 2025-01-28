// const ProductAdmin = require('../models/productAdmin-model');
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
        // console.log(req.params);
        const productAdmin = await User.findOne({ _id: id });

        if (!productAdmin) {
            return res.status(404).json({ message: "ProductAdmin not found" });
        }
        //console.log(productAdmin);
        const populatedProductAdmin = await productAdmin.populate('products');
        //console.log(populatedProductAdmin);
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
    console.log("File:", req.file);
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
        const productAdmin = await User.findById(userID);
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
        console.log(req.params);
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const productAdmin = await User.findById(product.productAdmin);
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
  // console.log(cartItems);
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
    const { userId, cartItems,delta } = req.body;
    console.log("Sync Cart Request:");
    console.dir( req.body, { depth: null });

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
    const mergedCart = [...user.cart];
    // console.log("Merged Cart Before:", mergedCart);
    console.log("Cart Items before merged:", cartItems);
      for (let newItem of cartItems) {
        // console.log("Processing New Item:", newItem);
        // Check if the item already exists in the cart
        const existingItem = mergedCart.find(
          (item) => item.productId._id == newItem.productId._id
        );
  
        if (existingItem) {
          // Update quantity for existing items
          console.log("inside");
          console.log("Existing Item:", true);
          if(existingItem.quantity< newItem.quantity && !delta){
            existingItem.quantity = newItem.quantity;
          }
          if(delta ==1 || delta == -1){
            console.log("inside2");
            if(existingItem.quantity + delta <1){
              existingItem.quantity += 0;
            }else{
              console.log("inside3");
              existingItem.quantity += delta;
              console.log(existingItem.quantity);
            }
          }
        } else if(existingItem !== -1) {
          console.log("Existing Item:", false);
          // Add only new items to the cart
          mergedCart.push({
            productId: newItem.productId._id, // Use new item product ID
            quantity: newItem.quantity, // Use new item rent quantity
            addedAt: newItem.addedAt, // Use new item addedAt timestamp
          });
        }
      }
      // console.log("Merged Cart:", mergedCart);   

    // Update user's cart in the database
    user.cart = mergedCart.map((item) => ({
      productId: item.productId._id || item.productId, // Store as ID
      quantity: item.quantity,
      addedAt: item.addedAt || new Date(),
    }));

    await user.save();

    // Re-populate the cart for the response
    const updatedUser = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product',
    });

    res.json({
      message: "Cart synced successfully",
      cart: updatedUser.cart,
      // cart: updatedUser.cart.map((item) => ({
      //   ...item.productId.toObject(), // Spread the populated product fields
      //   quantity: item.quantity,     // Add the quantity field from the cart item
      // })),
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ message: `Error syncing cart: ${error.message}` });
  }
};



const deletedCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body; // Extract userId and productId from the request body
    console.log("delete",req.body);
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the item from the cart
    const updatedCart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    // Update the user's cart
    user.cart = updatedCart;
    await user.save();

    // Re-populate the cart to include product details
    // const updatedUser = await User.findById(userId).populate({
    //   path: 'cart.productId',
    //   model: 'Product',
    // });

    res.status(200).json({
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: `Error deleting cart item: ${error.message}` });
  }
};



module.exports = { addProduct, deleteProduct, fetchProduct, fetchAllProduct, updateProduct, validateCart, syncCart , deletedCartItem};
