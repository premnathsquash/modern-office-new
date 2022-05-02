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
       /* 
      const checkSeat1 = Object.keys(seat.seats[0]).filter(ele=> ele==bookedSeat)
      const checkSeat2 = Object.keys(seat.seats[0]).filter(ele=> ele!=bookedSeat)

      console.log(Object.values(seat.seats[0]).some(checkSeat1));
     
      if(checkSeat1){
      await Seat.findOneAndUpdate({ _id: user.reservation.allocatedDesk }, {
        seats: [seat.seats[0][bookedSeat].timesBooked] +1
      }, (err1, data1)=>{
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }
        console.log( data1 );
      }); 
      await Profile.findOneAndUpdate({ _id: req.userId }, {}, (err, data2)=>{

      }); 
    } 
    */

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
      const {id, dp, firstName, lastName, email, slug} = el;
      return {id, dp, name: `${firstName} ${lastName}`, email, slug}
    });
    return res.send(result);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
