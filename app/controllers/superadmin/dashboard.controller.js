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
        id: comapny_Id,
        slug: companyName,
        dp: companyImg,
        _doc: { active: companyStatus },
        profile,
      } = comapnyInd;

      const proDum = profile.map((ele1) => {
        let temp;
        if (ele1.reservation.booking) {
          temp = ele1.reservation.booking.map((range) => {
            return {
              id: range.id,
              date: new Date(range.desk.date).toISOString().split("T")[0],
              timeZone: range.timeZone,
            };
          });
        }
        return {
          size: ele1.reservation.booking.length,
          elements: { profile: ele1.id, bookings: temp },
        };
      });

      return {comapny_Id, companyName, companyImg, companyStatus, companyId, proDum };
    });
    Promise.all(companies).then((data) => { 
      const temp = data.map((ele) => {
        let total, bookInfo;
        if (ele.proDum) {
          total = ele.proDum.reduce(
            (previousValue, currentValue) => previousValue + currentValue.size,
            0
          );

          bookInfo = ele.proDum
            .map((ele1) => {
              if (ele1.size > 0) {
                return ele1.elements.bookings.map((ele2) => {
                  return ele2;
                });
              }
            })
            .filter((n) => n);
        }
        return {
          company_id: ele.comapny_Id,
          companyTotalBook: total,
          companyMetaBook: bookInfo,
          companyName: ele.companyName,
          compayImage: ele.companyImg,
          companyStatus: ele.companyStatus,
          companyId: ele.companyId,
        };
      });
      const temp2 = temp.map((ele) => {
        const newSet = new Set();
        const newSet1 = new Set();
        if (ele.companyMetaBook.length > 0) {
          ele.companyMetaBook.flat(2).map((ele2) => {
            newSet.add(ele2.date);
          });
        }
        const checkArr = Array.from(newSet);
        checkArr.map((check) => {
          let check1 = 0;
          if (ele.companyMetaBook.length > 0) {
            ele.companyMetaBook.flat(2).map((ele3) => {
              if (ele3.date == check) check1 += 1;
            });
          }
          newSet1.add({ [check]: check1 });
        });
        return { ...ele, dashDate: Array.from(newSet1) };
      });

      return res.send(temp2);
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
