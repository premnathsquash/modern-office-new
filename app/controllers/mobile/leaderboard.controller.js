const db = require("../../models");
const LeaderBoard = db.leaderBoard;
const Profile = db.profile;
const User = db.user;
exports.list = async (req, res) => {
  try {
    await Profile.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await User.findOne({ _id: data.userGroup }, async (err0, data0) => {
        if (err0) {
          res.status(500).send({ message: err0 });
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
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
