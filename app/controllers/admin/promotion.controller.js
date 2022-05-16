const db = require("../../models");

const Promotion = db.promotion;

exports.listPromotion = async (req, res) => {
  try {
   // const company = await User.findOne({_id:req.userId })
    await Promotion.find({}, (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      const data1 = [];
      data.forEach((el) => {
        const { id, image, company, offer, validTill, createdAt } = el;
        data1.push({
          id,
          image,
          company,
          offer,
          claimed: 0,
          validTill,
          createdAt,
        });
      });
      return res.status(200).send({ data: data1 });
    });
  } catch (err) {
    return res.json({ res: "Error in showing promotion" });
  }
};
