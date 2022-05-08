const db = require("../../models");
const LeaderBoard = db.leaderBoard;
const User = db.user;
const Profile = db.profile;

exports.list = async (req, res) => {
  try {
    await User.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      const list = await LeaderBoard.find({ companyId: data.id }).populate({
        model: "Profile",
        path: "profileId",
      }).populate({
        path: "profileId",
        populate: {
          path: "reedemInfo.promotionId",
        },
      });

      let result = list.map((ele) => {
        const redeem_info_temp = ele.profileId?.reedemInfo.map(ele1=>{
          const obj = {off: ele1?.promotionId?.offer, pic: ele1?.promotionId?.image};
          return obj;
        })
        
        const obj = {
          id: ele.profileId.id,
          teammemberName: `${ele.profileId.firstName} ${ele.profileId.lastName}`,
          teammemberDp: ele.profileId.dp,
          coins: ele.profileId.points,
          coinsSpent: ele.profileId.pointsSpent,
          redeemedInfo: redeem_info_temp[0],
        };
        return obj;
      });
      result = result.sort((a, b) => (a.coins > b.coins ? -1 : 1));

      return res.send(result);
    });
  } catch (err) {
    return res.status(500).send({ message: error });
  }
};
