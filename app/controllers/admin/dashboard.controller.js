const db = require("../../models");
const Profile = db.profile;
const User = db.user;
const Office = db.office;
const Floor = db.floor;
const Seat = db.seats;

exports.seatinfo = async (req, res) => {
  try {
    await User.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      const office = await Office.find({ slug: data.slug }).populate({
        path: "floors",
      }).populate({ 
        path: 'floors',
        populate: {
          path: 'Seats',
        } 
     })
      console.log(office);
      

      return res.send("data1");
    });
  } catch (err) {
    return res.status(500).send({ message: error });
  }
};
