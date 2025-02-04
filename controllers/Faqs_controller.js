// controllers/faqController.js

const FAQ = require('../models/Faqs');

const fetchFaqs = async(req,res)=>{
    try{
        const faqs = await FAQ.find();
        return res.status(200).json(faqs);
    }catch (error) {
    return res.status(500).json({ message: 'Error fetching FAQs', error });
  }
}

const getFAQsByPage = async (req, res) => {
  try {
    const { page } = req.params;
    const faqs = await FAQ.find({ page });
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching FAQs', error });
  }
};

const createFAQ = async (req, res) => {
  try {
    const { page, question, answer } = req.body;
    const newFAQ = new FAQ({ page, question, answer });
    await newFAQ.save();
    return res.status(201).json(newFAQ);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating FAQ', error });
  }
};

const deleteFAQ = async (req, res) => {
    try {
      const { id } = req.params;
      await FAQ.findByIdAndDelete(id);
      return res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting FAQ', error });
    }
  };
  
  const updateFAQ = async (req, res) => {
    try {
      const { id } = req.params;
      const { page, question, answer } = req.body;
      const updatedFAQ = await FAQ.findByIdAndUpdate(id, { page, question, answer }, { new: true });
      return res.status(200).json(updatedFAQ);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating FAQ', error });
    }
  };

module.exports ={getFAQsByPage, createFAQ, deleteFAQ, updateFAQ, fetchFaqs};