const db = require("../../models");

const Promotion = db.promotion;
const Vendor = db.vendor;
const Profile = db.profile;

exports.list = async (req, res) => {
  try {
    await Promotion.find({}, (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      const result = data.map((ele) => {
        const obj = {
          productId: ele.id,
          productName: ele.productName,
          productOff: ele.offer,
          productImage: ele.image,
          productDescription: ele.description,
          productPointNeeded: ele.pointsNeeded,
          productCoupon: ele.coupon,
        };
        return obj;
      });
      return res.status(200).send({ data: result });
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.claiming = async (req, res) => {
  try {
    const { promotionId } = req.body;
    const profile = await Profile.findOne({ _id: req.userId });
    const promotion = await Promotion.findOne({ _id: promotionId });
    const vendor = await Vendor.findOne({ promotionIds: [promotionId] });
    const check = promotion.companyClaimed.find(
      (ele) => ele["companyId"].toString() == profile.userGroup.toString()
    )
      ? true
      : false;      
    const profileInfo = {
      companyId: profile.userGroup,
      profiles: profile.id,
    };
    if (!check) {
      await Promotion.findOneAndUpdate(
        { _id: promotionId },
        { claimed: promotion?.claimed + 1 ?? 1, companyClaimed: [profileInfo] },
        { new: true },
        (err, data) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
        }
      );
    } else {
      const promotion1 = await Promotion.findOne({ _id: promotionId });
      await Promotion.findOneAndUpdate(
        { _id: promotionId },
        { claimed: promotion?.claimed + 1 ?? 1, companyClaimed: [...promotion1.companyClaimed, profileInfo] },
        { new: true },
        (err, data) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
        }
      );
    }

    

    return res.send("OK");
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
