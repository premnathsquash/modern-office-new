require("dotenv").config()
const db = require("../../models");
const User = db.user;

exports.getAllCompanies = async (req, res) => {
  let admin = await User.findOne({
    _id: process.env.adminId,
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
