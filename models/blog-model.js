const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
   title:{
    type: String,
    required: true,
   },
   description: {
    type: String,
    required: true,
   }, 
   coverImage: {
    type: String,
    default: "https://via.placeholder.com/1200x500"
   },
   content: {
    type: String,
    required: true
   },
   category:{
    type: String,
    required: true
   },
   date: {
    type: Date, // Use the Date type to store both date and time
    default: Date.now // Automatically set the current date and time by default
 },
 userImage:{
    type: String,
    default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
 },
 author: {
    type: String,
    default: "Admin"
 },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;