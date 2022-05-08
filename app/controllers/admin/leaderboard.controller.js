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
      });

      let result = list.map((ele) => {
        const obj = {
          id: ele.profileId.id,
          teammemberName: `${ele.profileId.firstName} ${ele.profileId.lastName}`,
          teammemberDp: ele.profileId.dp,
          coins: ele.profileId.points,
          coinsSpent: ele.profileId.pointsSpent,
          redeemedInfo: {
            off: 0,
            pic: "",
          },
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
