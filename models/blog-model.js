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
   tags:{
      type: String,
      required: true,
   },
   isOnCoverTop:{
      type: String,
      default: false,
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
    required: true
    },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;