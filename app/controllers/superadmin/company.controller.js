const db = require("../../models");
const User = db.user;

exports.getAllCompanies = async (req, res) => {
  const admin = await User.findOne({
    _id: "626573171459db7cc9168eda",
  });
  
  console.log(admin);
  //console.log(`${temp}`.substring(3, 27));

  return res.status(200).send("work");
};
