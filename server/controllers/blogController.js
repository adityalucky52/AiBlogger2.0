import fs from "fs/promises";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import main from '../configs/gemini.js';

export const addBlog = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    // Parse blog string -> object
    let blogData;
    try {
      blogData = JSON.parse(req.body.blog);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in blog field",
      });
    }

    const { title, subTitle, description, category, isPublished } = blogData;
    const imageFile = req.file;

    // Validation
    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: title, description, category, and image are mandatory",
      });
    }

    console.log("Blog Data:", blogData);
    console.log("Image File:", imageFile);

    // Read file buffer
    const fileBuffer = await fs.readFile(imageFile.path);
    console.log("File Buffer Length:", fileBuffer.length);

    console.log("Uploading to ImageKit with file:", {
      name: imageFile.originalname,
      size: imageFile.size,
      path: imageFile.path,
    });

    // Upload Image to ImageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    console.log("ImageKit Response:", response);

    // Optimized image URL
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    console.log("Optimized Image URL:", optimizedImageUrl);

    // Save to DB
    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image: optimizedImageUrl,
      isPublished,
    });

    res.json({ success: true, message: "Blog added successfully" });
  } catch (error) {
    console.error("Error in addBlog:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);

    // Delete all comments associated with the blog
    await Comment.deleteMany({ blog: id });

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);
    blog.isPublished = !blog.isPublished;
    await blog.save();
    res.json({ success: true, message: "Blog status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;
    await Comment.create({ blog, name, content });
    res.json({ success: true, message: "Comment added for review" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;
    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    }).sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt)

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Provide a clear instruction to the model. Return plain text/markdown suitable for client parsing.
    const instruction = `${prompt.trim()}\n\nPlease generate a detailed blog post about the above topic in simple language. Return the result as plain text or markdown (no surrounding JSON).`;

    const content = await main(instruction);

    // Ensure we return a string
    const resultText = (typeof content === 'string' ? content : (content?.toString?.() || '')) .trim();

    res.json({ success: true, content: resultText });
  } catch (error) {
    console.error('Error in generateContent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
