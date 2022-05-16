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
      moment().startOf("isoWeek").format("MM/DD/YYYY");
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


  } catch (error) {
    return res.status(500).send({ message: error });
  }
}

exports.peakTimesQuiteTimes = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek = moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
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