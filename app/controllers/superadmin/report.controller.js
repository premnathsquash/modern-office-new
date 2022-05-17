require("dotenv").config();
const moment = require("moment");
const db = require("../../models");
const User = db.user;
const Office = db.office;
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

    const admin = await User.findOne({ _id: process.env.adminId });
    const company = admin._doc.connection.filter(
      (el) => el.toString() == req.params.id
    );

    if (company[0]) {
      const data = await User.findOne({ _id: company[0] }).populate({
        path: "profile",
        populate: {
          path: "reservation.booking",
        },
      });

      if (data.profile.length > 0) {
        let arr = [];
        const counts = {};
        const result = data.profile.map((el) => {
          return { profile: el?.id, bookings: el?.reservation?.booking };
        });
        result.map((el) => {
          el.bookings.map((ele) => {
            arr.push(new Date(ele?.desk.dateFrom).toLocaleDateString());
          });
        });

        const arr1 = arr.filter(
          (el) =>
            moment(el, "mm-dd-yyyy").isSame(
              moment(startOfWeek, "mm-dd-yyyy")
            ) ||
            (moment(el, "mm-dd-yyyy").isAfter(
              moment(startOfWeek, "mm-dd-yyyy")
            ) &&
              moment(el, "mm-dd-yyyy").isBefore(
                moment(endOfWeek, "mm-dd-yyyy")
              )) ||
            moment(el, "mm-dd-yyyy").isSame(moment(endOfWeek, "mm-dd-yyyy"))
        );

        for (const num of arr1) {
          counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        return res.json(counts);
      }
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (error) {
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
    const admin = await User.findOne({ _id: process.env.adminId });
    const companyTemp = admin._doc.connection.filter(
      (el) => el.toString() == req.params.id
    );

    if (companyTemp[0]) {

      const company = await User.findOne({ _id: companyTemp[0] }).populate({
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

        const bookings2 = offices.map(el => {
          if (el.floors.length > 0) {
            return el.floors.map(el1 => {
              const [first] = el1?.Seats?.seats
              if (first) {
                return Object.values(first);
              }
              return null
            })
          }
        }).filter(el => el).flat(4).filter(el => !arrFloor.includes(el.displayName)).filter(el => el?.available ?? false)

        for (const data of bookings1) {

          counts[data.fromDate] = counts[data.fromDate] ? counts[data.fromDate] + 1 : 1
        }

        for (const data of bookings1) {

          counts1[data.fromDate] = bookings2.length - counts[data.fromDate]
        }
        return res.json({ booked: counts, avail: counts1 });

      } else {
        const bookings2 = offices.map(el => {
          if (el.floors.length > 0) {
            return el.floors.map(el1 => {
              const [first] = el1?.Seats?.seats
              if (first) {
                return Object.values(first);
              }
              return null
            })
          }
        }).filter(el => el).flat(4).filter(el => !arrFloor.includes(el.displayName)).filter(el => el?.available ?? false)
        console.log(weekRange);
        return res.json({ booked: "No booking Found", });
      }

    } else {

      return res.json({ res: "No data Found" });
    }

  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.peakTimesQuiteTimes = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const weekRange = [];
    const counts = {};

    let start = 0;
    while (start < 7) {
      weekRange.push({ date: moment(startOfWeek).add(start, 'days').format("MM/DD/YYYY"), day: moment(startOfWeek).add(start, 'days').format("ddd") })
      start++
    }
    const dates = weekRange.map(el => el.date)
    const days = weekRange.map(el => el.day)

    const admin = await User.findOne({ _id: process.env.adminId });
    const companyTemp = admin._doc.connection.filter(
      (el) => el.toString() == req.params.id
    );

    if (companyTemp[0]) {
      const company = await User.findOne({ _id: companyTemp[0] }).populate({
        path: "profile",
        populate: {
          path: "reservation.booking",
        },
      });
      if (company.profile.length > 0) {
        const temp = company.profile.map(el => {

          return el.reservation.booking.map(el1 => el1)
        }).filter(el => el).flat(4)

        const temp1 = temp.map(el => {
          if (dates.includes(moment(el.desk.dateFrom).format("MM/DD/YYYY")) || dates.includes(moment(el.desk.dateTo).format("MM/DD/YYYY"))) {
            return ({ fromDate: moment(el.desk.dateFrom).format("MM/DD/YYYY"), toDate: moment(el.desk.dateTo).format("MM/DD/YYYY"), fromTime: moment(el.desk.fromTime, "h:mm:ss A").format("HH:mm:ss"), toTime: moment(el.desk.toTime, "h:mm:ss A").format("HH:mm:ss"), booked: el.desk.booked, seatName: el.seat, seatBook: el.seatBook })
          } else {
            return null
          }
        }).filter(el => el)

        for (const data of temp1) {
          counts[data.fromDate] = counts[data.fromDate] ? [{ fromTime: data.fromTime, toTime: data.toTime }, ...counts[data.fromDate]] : [{ fromTime: data.fromTime, toTime: data.toTime }]
        }

        const checking1 = Object.entries(counts).map(([key, value], i) => {
          const intermediate = value.map((el, i) => {
            let occurance = 0
            if (moment(el["fromTime"], "HH:mm:ss").format("HH") == moment(value[i == value.length - 1 ? 0 : i + 1]["fromTime"], "HH:mm:ss").format("HH")) {
              const result = { [el["fromTime"]]: occurance + 1 }
              occurance++
              return result
            } else {
              return { [el["fromTime"]]: 1 }
            }
          })

          return { [days[dates.indexOf(key)]]: intermediate }
        })
        return res.json(checking1);
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
    const startOfWeek = moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek = moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
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