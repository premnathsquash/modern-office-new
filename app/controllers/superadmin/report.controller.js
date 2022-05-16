require("dotenv").config();
const moment = require("moment");
const db = require("../../models");
const User = db.user;

exports.peakDays = async (req, res) => {
  try {
    const { from, to } = req.query;
    const startOfWeek =
      (from && new Date(from).toLocaleDateString()) ??
      moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek =
      (to && new Date(to).toLocaleDateString()) ??
      moment().endOf("isoWeek").format("MM/DD/YYYY");

    const admin = await User.findOne({ _id: process.env.adminId });
    const company = admin._doc.connection.filter(
      (el) => el.toString() == req.params.id
    );
    if (company) {
      const data = await User.findOne({ _id: company }).populate({
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
            arr.push(new Date(ele?.desk.date).toLocaleDateString());
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

    if (companyTemp) {

      const company = await User.findOne({ _id: companyTemp }).populate({
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

    }else{

    }

    return res.json({ res: "No data Found" });
  }catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.peakTimesQuiteTimes = async (req, res) => {
  try {
    const startOfWeek =  moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek =  moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  }catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.conSingleDesk = async (req, res) => {
  try {
    const startOfWeek =  moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek =  moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  }catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.timeUtilization = async (req, res) => {
  try {
    const startOfWeek =  moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek =  moment().endOf("isoWeek").format("MM/DD/YYYY");
    return res.json({ res: "No data Found" });
  }catch(error){
    return res.status(500).send({ message: error });
  }
}