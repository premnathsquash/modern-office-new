const { DateTime } = require("luxon");

const db = require("../../models");
const Profile = db.profile;
const User = db.user;
const Seat = db.seats;
const Booking = db.booking;

exports.booking = async (req, res) => {
  try {
    const {
      bookedSeat,
      attendees,
      from,
      to,
      recurrence,
      recurrenceDays,
      timeZone,
    } = req.body;
    const user = await Profile.findOne({ _id: req.userId });
    const company = await User.findOne({ _id: user.userGroup });
    const seat = await Seat.findOne({ _id: user.reservation.allocatedDesk });
    const date1 = new Date(from).toLocaleTimeString();
    const date2 = new Date(from).toLocaleDateString();
    const date3 = new Date(to).toLocaleDateString();
    const booking = new Booking({
      profile: user.id,
      company: company.id,
      attendees: attendees ?? [],
      seatBook: seat.id,
      seat: bookedSeat,
      timeZone: timeZone,
      desk: {
        date: date1,
        from: date2,
        to: date3,
        recurrence: recurrence,
        recurrenceDays: recurrenceDays ?? []
      }
    });
    booking.save(async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      return res.json({message: "Booking created successfully"})
    });

    return res.send("h");
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
