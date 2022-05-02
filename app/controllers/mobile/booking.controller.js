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
        recurrenceDays: recurrenceDays ?? [],
      },
    });
    booking.save(async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      const checkSeat1 = [];
      const checkSeat2 = [];
      Object.entries(seat.seats[0]).forEach((ele) => {
        const [key, value] = ele;
        if (key == bookedSeat) {
          const newValue = { ...value, timesBooked: value.timesBooked + 1 };

          checkSeat1.push(newValue);
        } else {
          checkSeat2.push(value);
        }
      });
      const changesinObj = [...checkSeat1, ...checkSeat2].reduce(
        (a, v) => ({ ...a, [v.name]: v }),
        {}
      );
      await Seat.findOneAndUpdate(
        { _id: user.reservation.allocatedDesk },
        {
          seats: [{ ...changesinObj }],
        },
        (err1, data1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }
        }
      );
      await Profile.findOneAndUpdate({ _id: req.userId }, {
        points: user?.points + 10 ?? 10,
        reservation: {...user.reservation, booking: data.id, bookDate: data.createdAt}
      }, (err2, data2)=>{
        if (err2) {
          res.status(500).send({ message: err2 });
          return;
        }
      });  
    });

    return res.send({ message: "Booking created successfully" });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const user = await Profile.findOne({ _id: req.userId });
    const company = await User.findOne({ _id: user.userGroup }).populate({
      path: "profile",
    });
    const result = company.profile.map((el) => {
      const { id, dp, firstName, lastName, email, slug } = el;
      return { id, dp, name: `${firstName} ${lastName}`, email, slug };
    });
    return res.send(result);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
