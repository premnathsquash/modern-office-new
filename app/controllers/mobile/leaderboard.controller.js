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
      await User.findOne({_id: data.userGroup}, async(err0, data0)=>{

        if (err0) {
          res.status(500).send({ message: err0 });
          return;
        }

      await LeaderBoard.find({ companyId: data0.id }, (err1, data1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }

        const result = data1.map(async (el) => {
          const interme = el.book.map(el1=>{
            const {reedemInfo, to, from, bookedTime, bookId, coins, coinsSpent} = el1;
            return ({
              reedemInfo: reedemInfo ?? "", to: to ?? "", from: from ?? "", bookedTime: bookedTime ?? "", bookId, coins: coins ?? "", coinsSpent : coinsSpent ?? ""
            })
          })
          const intermediate = await Profile.findOne({ _id: el.profileId })
          return {
            id: el.id,
            teammemberName: `${intermediate.firstName} ${intermediate.lastName}`,
            teammemberDp: intermediate.dp,
            book: interme[0]
          };
        });

        Promise.all(result).then((data1) => {
          return res.send(data1);
        });
      });
    })
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
