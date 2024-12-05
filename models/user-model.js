const mongoose = require('mongoose');

const userSchema = new  mongoose.Schema({
    userName:{
        type: String,
        require: true,
    },
    mobileNumber:{
        type: String,
        require: true,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    userLogo:{
        type: String,
        default:"https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
    },
    opt:{
        type:String,
        require:false
    }
});

const User = new mongoose.model("User", userSchema);

module.exports = User;