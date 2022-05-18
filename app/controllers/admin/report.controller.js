const moment = require("moment");
const db = require("../../models");
const User = db.user;
const Office = db.office;
const Seat = db.seats;
const mongoose = db.mongoose;

exports.peakDays = async (req, res) => {
  try {
    const { from, to } = req.query;
    const startOfWeek =
      (from && new Date(from).toLocaleDateString()) ??
      moment().clone().weekday(0).format("MM/DD/YYYY");
    const endOfWeek =
      (to && new Date(to).toLocaleDateString()) ??
      moment().endOf("isoWeek").format("MM/DD/YYYY");

    const company = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
      populate: {
        path: "reservation.booking",
      },
    });

    if (company.profile.length > 0) {
      let arr = [];
      const counts = {};
      const result = company.profile.map((el) => {
        return { profile: el?.id, bookings: el?.reservation?.booking };
      });
      result.map((el) => {
        el.bookings.map((ele) => {
          arr.push(new Date(ele?.desk.dateFrom).toLocaleDateString());
        });
      });

      const arr1 = arr.filter(
        (el) =>
          moment(el, "mm-dd-yyyy").isSame(moment(startOfWeek, "mm-dd-yyyy")) ||
          moment(el, "mm-dd-yyyy").isAfter(moment(startOfWeek, "mm-dd-yyyy")) &&
          moment(el, "mm-dd-yyyy").isBefore(moment(endOfWeek, "mm-dd-yyyy")) ||
          moment(el, "mm-dd-yyyy").isSame(moment(endOfWeek, "mm-dd-yyyy"))
      );

      for (const num of arr1) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      }


      return res.json(counts);
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (err) {
    return res.status(500).send({ message: error });
  }
};
exports.totalOcc = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const arrFloor = ["Wall", "Door", "Toilet", "Diagonal Wall"];
    const weekRange = [];
    const counts = {};
    const counts1 = {};
    let start = 0;
    while (start < 7) {
      weekRange.push(moment(startOfWeek).add(start, 'days').format("MM/DD/YYYY"))
      start++
    }

    const company = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
      populate: {
        path: "reservation.booking",
        populate: [{ model: "Seats", path: "seatBook" }],
      },
    });
    const offices = await Office.find({ slug: company.slug }).populate({
      path: "floors", populate: {
        path: "Seats",
      },
    })

    if (company.profile.length > 0) {
      const bookings = []
      company.profile.map((el) => {
        bookings.push(el?.reservation?.booking);
      })
      const bookings1 = bookings.flat(4).map(el => {
        if (weekRange.includes(moment(el.desk.dateFrom).format("MM/DD/YYYY")) || weekRange.includes(moment(el.desk.dateTo).format("MM/DD/YYYY"))) {

          return ({ fromDate: moment(el.desk.dateFrom).format("MM/DD/YYYY"), toDate: moment(el.desk.dateTo).format("MM/DD/YYYY"), booked: el.desk.booked, seatName: el.seat, seatBook: el.seatBook })
        } else {
          return (null)
        }
      }).filter(el => el)

      let bookings2 = offices.flatMap(el => {
        if (el.floors.length > 0) {
          return el.floors.map(el1 => {
            if (el1?.Seats?.seats.length > 0) {
              const [first] = el1?.Seats?.seats
              return Object.values(first);

            }
          })
        } else {
          return null
        }
      }).flat(4).filter(el => {
        if (el)
          return !arrFloor.includes(el.displayName)
      })

      for (const data of bookings1) {

        counts[data.fromDate] = counts[data.fromDate] ? counts[data.fromDate] + 1 : 1
      }
      for (const data of bookings1) {
        counts1[data.fromDate] = bookings2.length - counts[data.fromDate]
      }
      return res.json({ booked: counts, avail: counts1 });

    } else {
      return res.json({ booked: "No Data Found", });
    }

  } catch (error) {
    return res.status(500).send({ message: error });
  }
}

exports.peakTimesQuiteTimes = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const weekRange = [];
    const timeRange = [];
    const counts = {};

    let start = 0;
    while (start < 7) {
      weekRange.push({ date: moment(startOfWeek).add(start, 'days').format("MM/DD/YYYY"), day: moment(startOfWeek).add(start, 'days').format("ddd") })
      start++
    }
    const dates = weekRange.map(el => el.date)
    const days = weekRange.map(el => el.day)

    const company = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
      populate: {
        path: "reservation.booking",
      },
    })
      .populate({ path: "officeConfigure" });

    const startTiming = moment(company.officeConfigure?.TimeFrom ?? "00:00:00", "HH:mm:ss").format("HH")
    const endTiming = moment(company.officeConfigure?.TimeTo ?? "24:00:00", "HH:mm:ss").format("HH")

    let timingcount = parseInt(startTiming)
    while (timingcount < (parseInt(endTiming) + 1)) {
      timeRange.push(timingcount)
      timingcount++
    }

    if (company.profile.length > 0) {
      const temp = company.profile.map(el => {
        return el?.reservation?.booking.map(el1 => el1)
      }).filter(el => el).flat(4)

      if (temp) {
        const temp1 = temp.map(el => {
          if (dates.includes(moment(el.desk.dateFrom).format("MM/DD/YYYY")) || dates.includes(moment(el.desk.dateTo).format("MM/DD/YYYY"))) {
            return ({ fromDate: moment(el.desk.dateFrom).format("MM/DD/YYYY"), toDate: moment(el.desk.dateTo).format("MM/DD/YYYY"), fromTime: moment(el.desk.fromTime, "h:mm:ss A").format("HH:mm:ss"), toTime: moment(el.desk.toTime, "h:mm:ss A").format("HH:mm:ss"), booked: el.desk.booked, seatName: el.seat, seatBook: el.seatBook })
          } else {
            return null
          }
        }).filter(el => el)

        for (const data of temp1) {
          counts[data.fromDate] = counts[data.fromDate] ? [{ fromTime: moment(data.fromTime, "HH:mm:ss").format("HH"), toTime: moment(data.toTime, "HH:mm:ss").format("HH") }, ...counts[data.fromDate]] : [{ fromTime: moment(data.fromTime, "HH:mm:ss").format("HH"), toTime: moment(data.toTime, "HH:mm:ss").format("HH") }]
        }

        const tempory1 = dates.reduce((a, v) => ({ ...a, [v]: null }), {})

        const counts1 = { ...tempory1, ...counts }

        const newObj = {}

        for (const [key, value] of Object.entries(counts1)) {
          newObj[days[dates.indexOf(key)]] = value;
        }

        const tempTimeRange = timeRange.reduce((a, v) => ({ ...a, [v]: 0 }), {});
        const checking1 = Object.entries(newObj).flatMap(([key, value], i) => {
          let temp = 0
          const check_1 = value.flatMap((el, i) => {
            let temp1 = {}
            temp++
            temp1[el["fromTime"]] = temp
            return temp1
          })
          if (check_1?.length > 0) {
            const changes = check_1[check_1?.length - 1];
            return { [key]: { ...tempTimeRange, ...changes } };
          } else {
            return { [key]: { ...tempTimeRange } };
          }
        })
        return res.json([...checking1]);
      } else {
        return res.json({ res: "No data Found" });
      }
    } else {
      return res.json({ res: "No data Found" });
    }


  } catch (error) {
    return res.status(500).send({ message: error });
  }
}

exports.conSingleDesk = async (req, res) => {
  try {
    const arr = ["one_seater", "two_seater", "four_seater", "six_seater", "eight_seater", "ten_seater"];
    const newSet = new Set()
    const company = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
      populate: {
        path: "reservation.booking",
        populate: [{ model: "Seats", path: "seatBook" }],
      },
    })
    if (company.profile.length > 0) {
      const temp = company.profile.map(el => {
        return el.reservation.booking.map(el1 => {
          newSet.add(el1.seatBook._id)
          return { seatId: el1.seatBook.id, seatName: el1.seat }
        })
      }).flat(4)
      const seatTemp = [...newSet]
      const seatTemp1 = seatTemp.map(async (el) => {
        const v0 = await Seat.findOne({ _id: el })
        const v1 = temp.filter(el1 => el1.seatId == el.toString())
        return [v0, v1]
      })
      Promise.all(seatTemp1).then(data => {
      // console.log(data[1].length);
       //console.log(data[0].seats.filter((el) => arr.includes(el?.type)))
       //console.log(data[0])
       return res.json({conference: 20, singleDesk: 60, twoseater: 10, fourseater: 0, sixseater: 0, eightseater: 10, tenseater: 0} );
      })
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.timeUtilization = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek = moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.topBootomDesk = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek = moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.shows = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek = moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.userDetailInfo = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek = moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}