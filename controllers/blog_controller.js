const Blog = require("../models/blog-model");
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Multer configuration to handle file uploads
const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        //console.log('Uploading file:', file.fieldname);
        cb(null, './uploads/Blogs');
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      }
    })
  });

// Controller function to add a new blog
const addBlog = async (req, res) => {
    try {
        //console.log(req.body);
        const {title, content, description, isOnCoverTop,tags, author, category} = req.body;
        //console.log("File:", req.file);
        let imagePath = null;
        if (req.file) {
            imagePath = `\\${req.file.path}`;
        }
        console.log(imagePath);
        const newBlog = new Blog({
            title,  
            description, 
            content,
            tags,
            isOnCoverTop, 
            category, 
            author, 
            coverImage: imagePath,
        });
        await newBlog.save();
        return res.status(200).json({ message: 'New blog successfully added', blog: newBlog });
    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// Controller function to fetch all blogs
const Blogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        if (blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found" });
        }
        //console.log(blogs);
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs" });
    }
};

// Controller function to fetch a single blog by ID
const fetchBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog" });
    }
};

const searchBlogs = async (req, res) => {
    try {
        const { query } = req.query; // Extract the query parameter
        //console.log(query);
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
        const blogs = await Blog.find({
            $or: [
                { title: searchRegex },
                { content: searchRegex },
                {description: searchRegex}, // Check if the content contains the query
                {category: searchRegex}
            ]
        }).sort({ date: -1 }); // Sort by latest date

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Error searching blogs", error: error.message });
    }
};

const CoverTopBlog = async (req, res) => {
    try {
      const { blogId } = req.body;
  
      const currentCoverTopBlog = await Blog.findOne({ isOnCoverTop: 'yes' });
      if (currentCoverTopBlog) {
        currentCoverTopBlog.isOnCoverTop = 'no';
        await currentCoverTopBlog.save();
      }
  
      const blogToUpdate = await Blog.findById(blogId);
      if (!blogToUpdate) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      blogToUpdate.isOnCoverTop = 'yes';
      await blogToUpdate.save();
      //console.log(blogToUpdate);
      res.status(200).json({updateBlog:blogToUpdate, previous:currentCoverTopBlog});
  
    } catch (error) {
      res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Delete a product
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log(req.params);
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        // Delete the cover image from the server if it exists
        if (blog.coverImage) {
            const imagePath = path.join(__dirname, '..', blog.coverImage); // Adjust the path
            try {
                    await fs.promises.unlink(imagePath);
                    console.log("Blog image deleted successfully.");
                  } catch (err) {
                    console.error("Error deleting Blog image:", err);
                  }
        }
        await Blog.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Blog deleted successfully', blog });
    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// update a Blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the existing blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let imagePath = blog.coverImage; // Keep existing image unless a new one is uploaded

    // If a new image is uploaded
    if (req.file) {
      imagePath = `/uploads/Blogs/${req.file.filename}`;

      // Delete the old image if it exists
      if (blog.coverImage) {
        const oldImagePath = path.join(__dirname, '..', blog.coverImage); // Get absolute path
        console.log("Attempting to delete old blog image:", oldImagePath);

        // Ensure file exists before trying to delete it
        if (fs.existsSync(oldImagePath)) {
          try {
            await fs.promises.unlink(oldImagePath);
            console.log("Previous blog image deleted successfully.");
          } catch (err) {
            console.error("Error deleting previous blog image:", err);
          }
        } else {
          console.warn("Previous blog image file not found:", oldImagePath);
        }
      }
    }

    // Update blog data
    const updatedData = { ...req.body, coverImage: imagePath };

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog update failed" });
    }

    return res.status(200).json({
      message: "Successfully updated the blog",
      blog: updatedBlog
    });

  } catch (error) {
    return res.status(500).json({
      message: `Error while updating the blog: ${error.message}`
    });
  }
};


// Export the controller functions
module.exports = { addBlog, Blogs, fetchBlog, upload, searchBlogs, CoverTopBlog, deleteBlog,updateBlog };