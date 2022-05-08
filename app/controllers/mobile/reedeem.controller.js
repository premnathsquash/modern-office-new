const db = require("../../models");

const Promotion = db.promotion;


exports.list = async (req, res) => {
  try {
    await Promotion.find({}, (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    const result = data.map(ele=>{
     
      const obj = {
        productId: ele.id,
        productName: ele.productName,
        productOff: ele.offer,
        productImage: ele.image,
        productDescription: ele.description,
        productPointNeeded: ele.pointsNeeded,
        productCoupon: ele.coupon
      }
      return obj
    })
    return res.status(200).send({ data: result });
    })

  }catch(error){
    return res.status(500).send({ message: error });
  }

}