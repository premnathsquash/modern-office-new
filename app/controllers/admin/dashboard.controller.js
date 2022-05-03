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
      const office = await Office.find({ slug: data.slug })
        .populate({
          path: "floors",
        })
        .populate({
          path: "floors",
          populate: {
            path: "Seats",
          },
        });
      const seats = office
        .map((el) => {
          return el.floors;
        })
        .flat(2);
      const seatArr = seats.map((el) => {
        const [first] =(el.Seats.seats);
        const objV = Object.values(first);
        return (objV);
      }).flat(2);
      const arr = ["Wall", "Door", "Toilet", "Diagonal Wall"]
      const seat1 = seatArr.filter(el=> !arr.includes(el.displayName))
      const seat2 = seat1.filter(el=> el.timesBooked > 0)
      return res.send({totalSeats: seat1, bookedSeats: seat2});
    });
  } catch (err) {
    return res.status(500).send({ message: error });
  }
};
