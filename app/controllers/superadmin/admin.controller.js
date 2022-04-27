const bcrypt = require("bcryptjs");

const { sendMail } = require("../../config/mailer");
const db = require("../../models");
const User = db.user;
exports.getAdminProfile = async (req, res) => {
  const admin = await User.findOne({
    _id: "626573171459db7cc9168eda",
  });
  const obj = {
    username: admin._doc.meta.username,
    userimage: admin._doc.dp,
    useremail: admin._doc.email,
    officename: admin._doc.meta.comapnyName,
    officeimage: admin._doc.meta.companyImage,
    officeaddress: admin._doc.meta.address,
    officepincode: admin._doc.meta.pincode,
    officestate: admin._doc.meta.state,
    officecity: admin._doc.meta.city,
    officecountry: admin._doc.meta.country,
  }

  
  return res.status(200).send({ ...obj });
}
