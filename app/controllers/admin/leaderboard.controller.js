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
      await LeaderBoard.find({ companyId: data.id }, (err1, data1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }
        const result = data1.map(async(el)=>{
          const interme = el.book.map(el1=>{
            const {reedemInfo, to, from, bookedTime, bookId, coins, coinsSpent} = el1;
            return ({
              reedemInfo: reedemInfo ?? "", to: to ?? "", from: from ?? "", bookedTime: bookedTime ?? "", bookId, coins: coins ?? "", coinsSpent : coinsSpent ?? ""
            })
          })
          const intermediate = await Profile.findOne({_id: el.profileId})
          return ({
            id: el.id,
            teammemberName: `${intermediate.firstName} ${intermediate.lastName}`,
            teammemberDp: intermediate.dp,
            book: interme[0]
          })
        })

        Promise.all(result).then(data1=>{
          return res.send(data1);
        })
      });
    });
  } catch (err) {
    return res.status(500).send({ message: error });
  }
};

