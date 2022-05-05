require("dotenv").config()
const db = require("../../models");
const User = db.user;
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: "6268f92820a41c3eaf08ad1a",
    });
    if (req.userId == "6268f92820a41c3eaf08ad1a") {
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
      };
      return res.status(200).send({ ...obj });
    } else {
      await await User.findOne({
        _id: req.userId,
      }, (error, data)=>{
        if (error) {
          res.status(500).send({ message: error });
          return;
        }
        const obj = {
        username: data?.username,
        firstName: data?._doc?.meta?.firstName ?? "",
        lastName: data?._doc?.meta?.lastName ?? "",
        userimage: data?.dp ?? "",
        useremail: data?.email,
        officename: admin._doc.meta.comapnyName,
        officeimage: admin._doc.meta.companyImage,
        officeaddress: admin._doc.meta.address,
        officepincode: admin._doc.meta.pincode,
        officestate: admin._doc.meta.state,
        officecity: admin._doc.meta.city,
        officecountry: admin._doc.meta.country,
        }
        return res.status(200).send({...obj});
      });
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
