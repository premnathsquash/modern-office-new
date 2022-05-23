const { DateTime } = require("luxon");
const moment = require("moment");

const db = require("../../models");
const Profile = db.profile;
const User = db.user;
const Seat = db.seats;
const Booking = db.booking;
const LeaderBoard = db.leaderBoard;
const Activity = db.activity;

exports.booking = async (req, res) => {

  try {
    const {
      bookedSeat,
      seatType,
      attendees,
      from,
      to,
      recurrence,
      recurrenceDays,
      timeZone,
    } = req.body;
    const user = await Profile.findOne({ _id: req.userId });
    const company = await User.findOne({ _id: user.userGroup }).populate({ path: "officeConfigure" });
    const activity = await Activity.findOne({ userId: req.userId, companyId: user.userGroup });

    const seat = await Seat.findOne({ _id: user.reservation.allocatedDesk });
    let bookingChecking1;
    const date = moment(from).utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString()
    const date1 = moment(to).utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString()

    const timefrom = moment(from).format('hh:mm A');
    const timeto = moment(to).format('hh:mm A');

    let bookingChecking = await Booking.find({
      company: company.id,
      seatBook: seat.id,
      seat: bookedSeat,
      "desk.dateFrom": date,
      "desk.dateTo": date1,
      "desk.fromTime": timefrom,
      "desk.toTime": timeto,
    });

    if (!(bookingChecking.length > 0)) {
      const booking = new Booking({
        profile: user.id,
        company: company.id,
        attendees: attendees ?? [],
        seatBook: seat.id,
        seat: bookedSeat,
        seatType: seatType,
        timeZone: timeZone,
        desk: {
          dateFrom: date,
          dateTo: date1,
          fromTime: timefrom,
          approved: !company.officeConfigure.aprovalWorkflow ? true : false,
          booked: !company.officeConfigure.aprovalWorkflow ? true : false,
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
              desk: { dateFrom: dateOrigin, fromTime, toTime },
            } = data;

            const leaderresult = await LeaderBoard.findOne({
              companyId: data.company,
              profileId: data.profile,
            });

            if (!leaderresult) {
              const leaderinter = new LeaderBoard({
                companyId: data.company,
                profileId: data.profile,
                consecutiveDays: 0,
                book: [
                  {
                    bookId: data.id,
                    bookedTime: dateOrigin,
                    fromTime,
                    toTime,
                    coins: Number.parseFloat(10),
                  },
                ],
              });
              leaderinter.save(async (err3, data3) => {
                if (err) {
                  res.status(500).send({ message: err3 });
                  return;
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
/*
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
              } */

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
                  consecutiveDays:  0,
                  book: [
                    {
                      bookId: data.id,
                      bookedTime: dateOrigin,
                      from,
                      to,
                      coins: Number.parseFloat(10),
                    },
                    ...leaderresult.book,
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
        const notifyObj = {activityTitle: "You have booked a seat", message: `${bookedSeat} has been booked`, fromDate: date, todate: date1, timefrom, timeto}
        await Activity.findOneAndUpdate({ _id: activity._id }, { notifications: [notifyObj, ...activity.notifications] }, { new: true }, (err10, data10) => {
          if (err10) {
            res.status(500).send({ message: err10 });
            return;
          }
        })
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
    } else {
      return res.send({
        message:
          "Booking not possible with this time since already the seat is allocated on the timeframe",
      });
    }
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
        date: ele.desk.dateFrom.toLocaleDateString(),
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
