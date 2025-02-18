const Transaction = require("../models/transaction"); // Import Transaction schema
const User = require("../models/User");
const Address = require("../models/Address-model");

// Controller for "Book Now and Pay Later"
const bookNowTransaction = async (req, res) => {
  try {
    const { userID, orderItems, coupon, amountPay, address } = req.body;
    //console.log(req.body);
    // Validate input
    if (!userID || !orderItems || orderItems.length === 0 || !address) {
      return res.status(400).json({ message: "Invalid request. All fields are required." });
    }

    // Check if the user exists
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the address exists
    const userAddress = await Address.findById(address);
    if (!userAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      userID,
      orderItems,
      coupon: coupon || null,
      amountPay, // Total payable amount (will be paid later)
      status: "pending", // Payment is pending
      bookNow: true, // Indicates "Book Now & Pay Later"
      paymentMethod: "COD", // Payment is deferred
      address,
    });
    console.log(newTransaction);
    user.orders.push({orderID:newTransaction._id});
     // ✅ Clear user's cart after successful order
    user.cart = []; // Clear the cart array in User
    await user.save();
    // Save transaction in DB
    await newTransaction.save();
    return res.status(200).json({
      message: "Booking successful! Pay at the time of installation.",
      transactionID: newTransaction._id,
    });
  } catch (error) {
    console.error("Book Now Error:", error);
    return res.status(500).json({ message: "Server error while processing the transaction." });
  }
};

// fetch single book order 
const fetchBookOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
  
      // ✅ Fetch the transaction & populate orderItems and address details
      const order = await Transaction.findById(orderId)
        .populate("address") // Get full address details
        .populate("userID", "name email mobileNumber") // Get user name & email
        .populate('technician','name email mobileNumber')
        .populate({
          path: "orderItems.productId", // Populate each product inside orderItems
          select: "title mrp category productImage",
        });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Fetch Order Error:", error);
      return res.status(500).json({ message: "Failed to fetch the order" });
    }
};

const fetchedAllOrder = async(req,res)=>{
  try {
    const orders = await Transaction.find()
    .populate("address") // Get full address details
        .populate("userID", "name email mobileNumber") // Get user name & email
        .populate({
          path: "orderItems.productId", // Populate each product inside orderItems
          select: "title mrp category productImage",
        });
       return res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Order Error:", error);
      return res.status(500).json({ message: "Failed to fetch the order" });
  } 
}

const updateTechnician =async(req,res)=>{
  try {
    const { orderId, technicianId } = req.body;
    console.log("dhfdsfjdfhsd",req.body);
    if (!orderId || !technicianId) {
      return res.status(400).json({ message: "Order ID and Technician ID are required" });
    }

    // Check if the order exists
    const order = await Transaction.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the technician exists
    const technician = await User.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // ✅ Assign the technician to the order
    order.technician = technicianId;
    order.status = 'assigned'; // Mark order as assigned
    order.assignedAt = new Date();
    await order.save();

    return res.status(200).json({ message: "Technician assigned successfully", order });
  } catch (error) {
    console.error("Error assigning technician:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;
    console.log(req.body);
    // Find the order by ID
    const order = await Transaction.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    // Check if either status or paymentMethod is provided
    if (!status && !paymentMethod) {
      return res.status(400).json({ message: "Please provide a status or payment method to update!" });
    }

    // Update status if provided
    if (status) {
      order.status = status;
    }

    // Update paymentMethod if provided
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({ message: "Successfully updated order details!" });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Failed to update order!" });
  }
};

const fetchedOrderUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user and populate 'orders.orderID' from Transaction model
    const user = await User.findById(userId)
      .populate({
        path: "orders.orderID", // Populate order details from 'Transaction'
        model: "Transaction",
        populate: [
          {
            path: "orderItems.productId", // Populate products inside orderItems
            model: "Product"
          },
          {
            path: "address", // Populate address if needed
            model: "Address"
          }
        ]
      })
      .lean(); // Convert to plain JSON

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Populated Orders:", user.orders);
    return res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return res.status(500).json({ message: "Failed to fetch the orders" });
  }
};



module.exports = { bookNowTransaction, fetchBookOrder, fetchedAllOrder, updateTechnician,updateStatus, fetchedOrderUser };
