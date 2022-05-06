require("dotenv").config();
const { customAlphabet } = require("nanoid");
const { DateTime } = require("luxon");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);

const db = require("../../models");
const User = db.user;

exports.dashboard = async (req, res) => {
  try {
    const companyId = nanoid();
    const admin = await User.findOne({
      _id: process.env.adminId,
    });
    const companies = admin._doc.connection.map(async (ele) => {
      const comapnyInd = await User.findOne({ _id: ele._id })
        .populate({ path: "profile" })
        .populate({
          path: "profile",
          populate: {
            path: "reservation.booking",
          },
        });
      const {
        slug: companyName,
        dp: companyImg,
        _doc: { active: companyStatus },
        profile,
      } = comapnyInd;
      const proDum = profile.map((ele1) => {
        let temp;
        if (ele1.reservation.booking) {
          temp = ele1.reservation.booking.map((range) => {
            return { id: range.id, date: new Date(range.desk.date).toISOString(), timeZone: range.timeZone };
          });
        }
        return {
          size: ele1.reservation.booking.length,
          elements: { profile: ele1.id, bookings: temp },
        };
      });

      return { companyName, companyImg, companyStatus, companyId, proDum };
    });
    Promise.all(companies).then((data) => {
     const temp =  data.map((ele) => {
        let total, bookInfo;
        if (ele.proDum) {
          total = ele.proDum.reduce(
            (previousValue, currentValue) => previousValue + currentValue.size,
            0
          );

          bookInfo = ele.proDum.map((ele1) => {
            if (ele1.size > 0) {
              return ele1.elements.bookings.map( (ele2) => {
                return ele2;
                
              });
            }
          }).filter(n=>n);
        }
        return {companyTotalBook: total, companyMetaBook: bookInfo, ...ele};
      });
      return res.send(temp);
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
