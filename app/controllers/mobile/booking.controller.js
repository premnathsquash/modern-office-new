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
        date: from,
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
      await Profile.findOneAndUpdate(
        { _id: req.userId },
        {
          claimedInfo: {
            promotion: user?.claimedInfo?.promotion,
            points:
              Number.parseFloat(user?.claimedInfo?.points) + 10 ??
              Number.parseFloat(10),
          },
          reservation: {
            ...user.reservation,
            booking: data.id,
            bookDate: data.createdAt,
          },
        },
        async (err2, data2) => {
          if (err2) {
            res.status(500).send({ message: err2 });
            return;
          }
          const bookingtimes = await Booking.find({
            profile: data.profile,
          }).sort({ createdAt: -1 });
          const intermediateBook = bookingtimes.map((el) => {
            return ({from: DateTime.fromFormat(el?.desk?.from, "MM/DD/YYYY").setZone(el.timeZone), to: DateTime.fromFormat(el?.desk?.to, "MM/DD/YYYY").setZone(el.timeZone)});
          });
          console.log(intermediateBook);
  
        }
      );
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
