const { DateTime } = require("luxon");
const moment = require("moment");

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
    let bookingChecking1
    const user = await Profile.findOne({ _id: req.userId });
    const company = await User.findOne({ _id: user.userGroup }).populate({path: "officeConfigure"});

    const seat = await Seat.findOne({ _id: user.reservation.allocatedDesk });

    const date = new Date(new Date(from).setHours(0, 0, 0, 0));
    const date1 = new Date(new Date(to).setHours(0, 0, 0, 0));
    const datefrom = new Date(from).toLocaleDateString();
    const dateto = new Date(to).toLocaleDateString();
    const timefrom = new Date(from).toLocaleTimeString();
    const timeto = new Date(to).toLocaleTimeString();

    const bookingChecking = await Booking.find({
      company: company.id,
      seatBook: seat.id,
      seat: bookedSeat,
    });


    if (bookingChecking) {
      bookingChecking1 = bookingChecking.filter((el) => {
        console.log(el);

        return (
          new Date(el.desk.dateFrom).toLocaleDateString() == datefrom &&
          new Date(el.desk.dateTo).toLocaleDateString() == dateto &&
          el.desk.fromTime == timefrom &&
          el.desk.toTime == timeto
        );
      });
    }

   
    

    //   if (!bookingChecking1) {
    const booking = new Booking({
      profile: user.id,
      company: company.id,
      attendees: attendees ?? [],
      seatBook: seat.id,
      seat: bookedSeat,
      timeZone: timeZone,
      desk: {
        dateFrom: new Intl.DateTimeFormat("en-US", {
          timeZone: timeZone,
        }).format(date),
        dateTo: new Intl.DateTimeFormat("en-US", {
          timeZone: timeZone,
        }).format(date1),
        fromTime: timefrom,
        approved: !company.officeConfigure.aprovalWorkflow ? true: false,
        booked: !company.officeConfigure.aprovalWorkflow ? true: false,
        toTime: timeto,
        recurrence: recurrence,
        recurrenceDays: recurrenceDays ?? [],
      },
    });

    booking.save(async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      await Profile.findOneAndUpdate(
        { _id: req.userId },
        {
          points:
            Number.parseFloat(user?.points) + 10.0 ?? Number.parseFloat(10.0),
          reservation: {
            ...user.reservation,
            booking: [...user.reservation.booking, data.id],
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
              book: [
                {
                  bookId: data.id,
                  bookedTime: interm.toLocaleString(),
                  from,
                  to,
                  coins: Number.parseFloat(10),
                },
              ],
            });
            leaderinter.save(async (err3, data3) => {
              if (err) {
                res.status(500).send({ message: err3 });
                return;
              }
              if (data3?.consecutiveDays) {
                const profile = await Profile.findOne({ _id: req.userId });
                const leaderboard = await LeaderBoard.findOne({
                  companyId: data01.companyId,
                  profileId: data01.profileId,
                });
              }
            });
          } else {
            let days = leaderresult.book.map((ele) => ele.bookedTime);
            days = days.sort((a, b) =>
              moment(a, "MM-DD-YYYY").isBefore(moment(b, "MM-DD-YYYY"))
                ? 1
                : -1
            );
            days = Array.from(new Set(days));

            let concecutionRange = 0;

            let dateCheck = interm.toLocaleString().split("/");

            let intialConsecuation =
              `${dateCheck[0]}/${dateCheck[1] - 1}/${dateCheck[2]}` ==
              days[0] ||
              `${dateCheck[0]}/${dateCheck[1] - 1}/${dateCheck[2]}` ==
              days[1];

            let intialConsecuation1 =
              `${dateCheck[0]}/${dateCheck[1] - 1}/${dateCheck[2]}` ==
              days[0];

            if (leaderresult?.consecutiveDays && intialConsecuation1) {
              concecutionRange += 1;
            }

            await Seat.findOne({ _id: seat.id }, async (err11, data11) => {
              if (err11) {
                res.status(500).send({ message: err11 });
                return;
              }
              const checkSeat1 = [];
              const checkSeat2 = [];
              Object.entries(data11.seats[0]).forEach((ele) => {
                const [key, value] = ele;
                if (key == bookedSeat) {
                  const newValue = {
                    ...value,
                    timesBooked: value.timesBooked + 1,
                    available: false,
                  };
                  checkSeat1.push(newValue);
                } else {
                  checkSeat2.push({ ...value });
                }
              });
              const changesinObj = [...checkSeat1, ...checkSeat2].reduce(
                (a, v) => ({ ...a, [v.name]: v }),
                {}
              );
              await Seat.findOneAndUpdate(
                { _id: seat.id },
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
            });

            await LeaderBoard.findOneAndUpdate(
              {
                companyId: data.company,
                profileId: data.profile,
              },
              {
                consecutiveDays: intialConsecuation
                  ? 1 + concecutionRange
                  : 0,
                book: [
                  ...leaderresult.book,
                  {
                    bookId: data.id,
                    bookedTime: interm.toLocaleString(),
                    from,
                    to,
                    coins: Number.parseFloat(10),
                  },
                ],
              },
              { new: true },
              async (err01, data01) => {
                if (err01) {
                  res.status(500).send({ message: err01 });
                  return;
                }
                if (data01?.consecutiveDays) {
                  const profile = await Profile.findOne({ _id: req.userId });
                  const leaderboard = await LeaderBoard.findOne({
                    companyId: data01.companyId,
                    profileId: data01.profileId,
                  });
                  await Profile.findOneAndUpdate(
                    { _id: req.userId },
                    {
                      points:
                        Number.parseFloat(profile.points) +
                        Number.parseFloat(data01?.consecutiveDays * 10),
                    },
                    { new: true },
                    () => { }
                  );
                }
              }
            );
          }
        }
      );
      await LeaderBoard.findOne(
        {
          companyId: data.company,
          profileId: data.profile,
        },
        (err9, data9) => {
          if (err9) {
            res.status(500).send({ message: err9 });
            return;
          }
          return res.send({
            message: "Booking created successfully",
            consecutiveDays: data9?.consecutiveDays,
          });
        }
      );
    });
    /*  } else {
       return res.send({
         message:
           "Booking not possible with this time since already the seat is allocated on the timeframe",
       });
     } */
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

exports.bookingHist = async (req, res) => {
  try {
    const user = await Profile.findOne({ _id: req.userId })
      .populate({
        path: "reservation.booking",
      })
      .populate({
        path: "reservation.booking",
        populate: { model: "Seats", path: "seatBook" },
      })
      .populate({
        path: "reservation.booking",
        populate: { model: "Profile", path: "attendees" },
      });

    const result = user?.reservation?.booking.map((ele) => {
      return {
        attandess: ele.attendees,
        date: ele.desk.date.toLocaleDateString(),
        desk: ele.desk,
        seat: ele.seatBook.seats["0"][ele.seat],
      };
    });

    const today = moment(new Date().toLocaleDateString(), "mm-dd-yyyy");
    let past = result.filter((el) => {
      return moment(el.date, "mm-dd-yyyy").isBefore(today, "day");
    });
    let present = result.filter((el) => {
      return moment(el.date, "mm-dd-yyyy").isSame(today, "day");
    });
    let future = result.filter((el) => {
      return moment(el.date, "mm-dd-yyyy").isAfter(today, "day");
    });

    past = past.map((el) => {
      const { attandess } = el;
      if (attandess.length > 0) {
        const restData = attandess.map((ele1) => {
          return {
            dp: ele1?.dp,
            userName: `${ele1?.firstName} ${ele1?.lastName}`,
          };
        });
        return { ...el, attandess: restData };
      } else {
        return el;
      }
    });
    present = present.map((el) => {
      const { attandess } = el;

      if (attandess.length > 0) {
        const restData = attandess.map((ele1) => {
          return {
            dp: ele1?.dp,
            userName: `${ele1?.firstName} ${ele1?.lastName}`,
          };
        });
        return { ...el, attandess: restData };
      } else {
        return el;
      }
    });
    future = future.map((el) => {
      const { attandess } = el;
      if (attandess.length > 0) {
        const restData = attandess.map((ele1) => {
          return {
            dp: ele1?.dp,
            userName: `${ele1?.firstName} ${ele1?.lastName}`,
          };
        });
        return { ...el, attandess: restData };
      } else {
        return el;
      }
    });

    return res
      .status(200)
      .send({ past: past, present: present, future: future });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
