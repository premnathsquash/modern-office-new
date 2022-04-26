const db = require("../../models");
const User = db.user;

exports.getAllCompanies = async (req, res) => {
  const admin = await User.findOne({
    _id: "626573171459db7cc9168eda",
  });
  let companies = admin._doc.connection.map(async (ele) => {
    const admin1 = await User.findOne(
      {
        _id: ele,
      },
      (err, doc) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      }
    );
    return admin1;
  });

  Promise.all(companies).then((data) => {
    return res.status(200).send(data);
  });

};
