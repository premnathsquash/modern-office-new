const db = require("../../models");
const Profile = db.profile
const Floor = db.floor
exports.mobileFloorDisplay = async (req, res) => {
  try {
    const userProfile = await Profile.findOne({_id: req.userId})
    const floor = await Floor.findOne({_id: userProfile.reservation.floor }).populate({path: "Seats"})
    const intermediate = Object.values(floor.Seats.seats[0])
    const result = intermediate.map(ele=>{
      return {...ele, available: true}
    })
    
    return res.status(200).send({ res: result });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
