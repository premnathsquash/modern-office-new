const db = require("../../models");
const Promotion = db.promotion;

exports.createPromotion = async (req, res) => {
  const {
    productName,
    category,
    pointNeeded,
    offer,
    validTill,
    link,
  } = req.body;
  const tempCategory = category
    .split(",")
    .map((ele) => ele.replace(/^\s+|\s+$/gm, ""));
  const promotion = new Promotion({
    productName,
    category: tempCategory,
    pointNeeded,
    offer,
    validTill,
    link,
  });
  promotion.save((err, data) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
  });
  res.status(200).send("Promotion created successfully...");
};
