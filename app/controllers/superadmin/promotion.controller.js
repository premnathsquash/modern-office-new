const db = require("../../models");

const Vendor = db.vendor;
const Promotion = db.promotion;

exports.createVendor = async(req, res)=>{
  return res
  .status(200)
  .send({ message: "Vendor created successfuly" });
}

exports.createPromotion = async(req, res)=>{
  return res
  .status(200)
  .send({ message: "promotion created successfuly" });
}