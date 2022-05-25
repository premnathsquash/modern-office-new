const moment = require("moment");
const db = require("../../models");
const User = db.user;
const Office = db.office;
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
      const seatArr = seats
        .map((el) => {
          if (el?.Seats?.seats) {
            const [first] = el?.Seats?.seats;
            if (first) {
              const objV = Object.values(first);
              return objV;
            } else {
              return {};
            }
          }
        })
        .flat(2);
      const arr = ["Wall", "Door", "Toilet", "Diagonal Wall"];
      const seat1 = seatArr.filter((el) => !arr.includes(el?.displayName));
      const seat2 = seat1.filter((el) => el?.timesBooked > 0);
      return res.send({ totalSeats: seat1, bookedSeats: seat2 });
    });
  } catch (err) {
    return res.status(500).send({ message: error });
  }
};

exports.bookingInfo = async (req, res) => {
  try {
    const { date } = req.params;
    const date1 = moment(date);
    //console.log(date1);

    const profile = await User.findOne({ _id: req.userId })
      .populate({ path: "profile" })
      .populate({
        path: "profile",
        populate: {
          path: "reservation.booking",
        },
      });
    const temp0 = profile?.profile
      .map((el) => {
        if (el.reservation?.booking?.length > 0) return el;
      })
      .filter((n) => n);
    if (temp0.length > 0) {
      const temp1 = temp0.map((el) => {
        const { id, dp, email, slug, firstName, lastName, reservation } = el;
        const tempReserv = reservation?.booking.map((el1) => {
          return el1;
        });
        return {
          id,
          dp,
          email,
          slug,
          firstName,
          lastName,
          bookingInfo: tempReserv,
        };
      });
      const temp2 = temp1.map((el) => {
        return el?.bookingInfo.map(async (el2) => {
          const result0 = await Seat.findOne({ _id: el2.seatBook });
          const result11 = result0.seats.map((el3) => {
            return { seats: el3[el2.seat], meta: { el2, el } };
          });
          return {
            fromTime: el2.desk.from,
            toTime: el2.desk.to,
            date: el2.desk.date,
            seatName: el2.seat,
            result11,
          };
        });
      });
      Promise.all(temp2[0]).then((data111) => {
        return res.send(data111);
      });
    } else {
      return res.send([]);
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.workFromHomeOrOffice = async (req, res) => {
  try {
    const users = await User.findOne({ _id: req.userId })
      .populate({ path: "profile" })
      .populate({
        path: "profile",
        populate: {
          path: "attendance",
        },
      });
    const result = users.profile.map((ele) => {
      const obj = {
        name: `${ele.firstName} ${ele.lastName}`,
        dp: ele.dp,
        date: ele.attendance.createdAt,
        days: ele.attendance.days,
        workfromoffice: ele.attendance.workfromoffice,
      };
      return obj;
    });
    const workfromOffice = result.filter((ele) => ele.workfromoffice);
    const workfromHome = result.filter((ele) => !ele.workfromoffice);

    return res
      .status(200)
      .send({ wrokfromoffice: workfromOffice, workfromHome: workfromHome });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.bookingReq = async (req, res) => {
  try {
    const { day } = req.query;
    let today = moment().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format("MM/DD/YYYY")
    if (day) {
      today = moment(day).utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format("MM/DD/YYYY")
    }
    
    const company = await User.findOne({ _id: req.userId })
      .populate({
        path: "profile",
      })
      .populate({
        path: "profile",
        populate: {
          path: "reservation.booking",
          populate: [{ model: "Seats", path: "seatBook" }],
        },
      });

    if (company.profile.length > 0) {
      const intermediate1 = company.profile.map((el) => {
        const {
          firstName,
          lastName,
          dp,
          reservation: { booking },
        } = el;

        const result1 = booking.map((el1) => {
          return { desk: el1?.desk, seat1: el1?.seat, seatBook: el1?.seatBook };
        });
        return { firstName, lastName, dp, result1 };
      });

      const data = intermediate1.map((el) => {
        
        
        const result = el?.result1.map((el1) => {
          return {
            recurrenceDays: el1.desk.recurrenceDays,
            cancelled: el1.desk.cancelled,
            approved: el1.desk.approved,
            booked: el1.desk.booked,
            dateFrom: el1.desk.dateFrom,
            dateTo: el1.desk.dateTo,
            fromTime: el1.desk.fromTime,
            toTime: el1.desk.toTime,
            recurrence: el1.desk.recurrence,
            seatBook: el1.seatBook.seats["0"][el1.seat1],
          };
        });
        
  
        let result1;

        if (day) {
          result1 = result.filter((ele1) => {

            return  moment(moment((new Date(ele1.dateFrom)).toISOString()).format("MM/DD/YYYY")).isSame(today)||
            moment(moment((new Date(ele1.dateFrom)).toISOString()).format("MM/DD/YYYY")).isAfter(today)
          });
        } else {
          result1 = result.filter((ele1) => {
            
            return (
              moment(moment((new Date(ele1.dateFrom)).toISOString()).format("MM/DD/YYYY")).isSame(today)||
              moment(moment((new Date(ele1.dateFrom)).toISOString()).format("MM/DD/YYYY")).isAfter(today)
            );
          });
        }
        
        console.log(result1);

        return {
          username: `${el.firstName} ${el.lastName}`,
          dp: el.dp,
          result1,
        };
      });

      return res.status(200).send(data);
    } else {
      return res.status(200).send([]);
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
