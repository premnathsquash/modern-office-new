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
  } catch (err) {
    return res.json({ res: "Error in read" });
  }
};
exports.totalOcc = async (req, res) => {}