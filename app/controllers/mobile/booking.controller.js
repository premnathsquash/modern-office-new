const { DateTime } = require("luxon");

const db = require("../../models");
const Profile = db.profile;
const User = db.user;
const Seat = db.seats;
const Booking = db.booking;
const LeaderBoard = db.leaderBoard;

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
    const date = new Date(new Date(from).setHours(0, 0, 0, 0));
    const date2 = new Date(from).toLocaleTimeString();
    const date3 = new Date(to).toLocaleTimeString();

    const booking = new Booking({
      profile: user.id,
      company: company.id,
      attendees: attendees ?? [],
      seatBook: seat.id,
      seat: bookedSeat,
      timeZone: timeZone,
      desk: {
        date: new Intl.DateTimeFormat("en-US", { timeZone: timeZone }).format(
          date
        ),
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
          const {
            desk: { date: date1, from, to },
          } = data;
          const intial = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hourCycle: "h23",
          }).format(date1);
          const [day, time] = intial.split(",");
          const [month, day1, year] = day.split("/");
          const [hour, minute, second] = time.split(":");
          const interm = DateTime.utc(
            parseInt(year),
            parseInt(month),
            parseInt(day1),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );
      
          const leaderresult = await LeaderBoard.findOne({
            companyId: data.company,
            profileId: data.profile,
          });
          
          if (!leaderresult) {
            const leaderinter = new LeaderBoard({
              companyId: data.company,
              profileId: data.profile,
              book: [{ bookId: data.id, bookedTime:  interm, from, to, coins: Number.parseFloat(user?.claimedInfo?.points) + 10 ??
                Number.parseFloat(10)}],
            });
            leaderinter.save((err3, data3) => {
              if (err) {
                res.status(500).send({ message: err3 });
                return;
              }
            });
          }else{
            await LeaderBoard.findOneAndUpdate({
              companyId: data.company,
              profileId: data.profile,
            }, {}, (err01, data01)=>{
              if (err01) {
                res.status(500).send({ message: err01 });
                return;
              }
            })
          }
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
