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
    const startOfWeek =  moment().startOf("isoWeek").format("MM/DD/YYYY");
    const endOfWeek =  moment().endOf("isoWeek").format("MM/DD/YYYY");

  }catch(error){
    return res.status(500).send({ message: error });
  }
}

exports.peakTimesQuiteTimes = async (req, res) => {
  try {}catch(error){
    return res.status(500).send({ message: error });
  }
}

exports.conSingleDesk = async (req, res) => {
  try {}catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.timeUtilization = async (req, res) => {
  try {}catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.topBootomDesk = async (req, res) => {
  try {}catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.shows = async (req, res) => {
  try {}catch(error){
    return res.status(500).send({ message: error });
  }
}
exports.userDetailInfo = async (req, res) => {
  try {}catch(error){
    return res.status(500).send({ message: error });
  }
}