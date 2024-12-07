const mongoose = require('mongoose');

const details = new mongoose.Schema({
    userName: {
        type: String,
        default: "User1", 
      },
      email: {
        type: String,
        require: true
      },
      account:{
        type: String,
        default: Regular
      },
      userLogo: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
      },
      userBg: {
        type: String,
        default: "https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg"
      },
      cardNo: {
        type: String,
        required: false
      },
})