const moment = require("moment");
const db = require("../../models");
const User = db.user;
const Office = db.office;
const Seat = db.seats;
const mongoose = db.mongoose;

exports.peakDays = async (req, res) => {
  try {
    const { from, to, term } = req.query;
    const company = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
      populate: {
        path: "reservation.booking",
      },
    });
    const weekfilter = async () => {
      const startOfWeek = moment().clone().weekday(0).format("MM/DD/YYYY");
      const endOfWeek = moment().clone().endOf("isoWeek").format("MM/DD/YYYY");

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
    }

    const monthfilter = async () => {
      /* const counts = {}
      const months = { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 }
      if (company.profile.length > 0) {
        company.profile.map((el) => {
          el?.reservation?.booking.map(el1 => {
            counts[moment(el1?.desk?.dateFrom).format('MMMM')] = counts[moment(el1?.desk?.dateFrom).format('MMMM')] ? counts[moment(el1?.desk?.dateFrom).format('MMMM')] + 1 : 1
          })
        })
        return res.json({ ...months, ...counts }); */

        const startOfMonth = moment().clone().startOf('month');
        console.log(startOfMonth);
        return res.json({ booked: "No Data Found", });
      /* } else {
        return res.json({ res: "No data Found" });
      } */
    }
    const customfilter = async (from, to) => {

      const startOfDate = moment(from);
      const endOfDate = moment(to);
      console.log(startOfDate, endOfDate);

    }
    const averagefilter = async () => {
      console.log("j");
    }

    switch (term) {
      case "month":
        await monthfilter()
        break;
      case "custom":
        await customfilter(from, to)
        break;
      case "average":
        await averagefilter()
        break;
      default:
        await weekfilter()
        break;
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
exports.totalOcc = async (req, res) => {

  try {
    const { from, to, term } = req.query;
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
    const weekfilter = async () => {
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
    }

    const monthfilter = async () => {

      const startOfMonth = moment().clone().startOf('month');
      console.log(startOfMonth);
      return res.json({ booked: "No Data Found", });
     }

    const customfilter = async (from, to) => {

      const startOfDate = moment(from);
      const endOfDate = moment(to);
      console.log(startOfDate, endOfDate);

    }
    const singleDatefilter = async () => {
      console.log("j");
    }
    switch (term) {
      case "month":
        await monthfilter()
        break;
      case "custom":
        await customfilter(from, to)
        break;
      case "single":
        await singleDatefilter()
        break;
      default:
        await weekfilter()
        break;
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
    const starttime001 = company.officeConfigure?.TimeFrom ? company.officeConfigure?.TimeFrom : null
    const endtime001 = company.officeConfigure?.TimeTo ? company.officeConfigure?.TimeTo : null
   
    const startTiming = moment(starttime001 ?? "00:00:00", "HH:mm:ss").format("HH")
    const endTiming = moment(endtime001 ?? "23:00:00", "HH:mm:ss").format("HH")

    let timingcount = parseInt(startTiming)
    while (timingcount < (parseInt(endTiming) + 1)) {
      timeRange.push(timingcount.toString().padStart(2, '0'))
      timingcount++
    }

    const tempTimeRange = timeRange.reduce((a, v) => ({ ...a, [v]: 0 }), {});

    const tempory1 = dates.reduce((a, v) => ({ ...a, [v]: tempTimeRange }), {})

    if (company.profile.length > 0) {
      const temp = company.profile.flatMap(el => {
        return el?.reservation?.booking.map(el1 => el1)
      }).flat(4)

      if (temp) {
        const temp1 = temp.map(el => {
          if (dates.includes(moment(el.desk.dateFrom).format("MM/DD/YYYY")) || dates.includes(moment(el.desk.dateTo).format("MM/DD/YYYY"))) {
            return ({ fromDate: moment(el.desk.dateFrom).format("MM/DD/YYYY"), fromTime: moment(el.desk.fromTime, "h:mm:ss A").format("HH:mm:ss"), toTime: moment(el.desk.toTime, "h:mm:ss A").format("HH:mm:ss") })
          } else {
            return null
          }
        })

        for (const data of temp1) {
          counts[data.fromDate] = counts[data.fromDate] ? [{ fromTime: moment(data.fromTime, "HH:mm:ss").format("HH"), toTime: moment(data.toTime, "HH:mm:ss").format("HH") }, ...counts[data.fromDate]] : [{ fromTime: moment(data.fromTime, "HH:mm:ss").format("HH"), toTime: moment(data.toTime, "HH:mm:ss").format("HH") }]
        }

        const result = Object.keys(tempory1).map(el => {
          const resultObj = []
          const resultObj1 = []
          resultObj1.push({ [days[dates.indexOf(el)]]: { ...tempory1[el] } });
          Object.keys(counts).map(el1 => {
            if (el== el1) {
              let temp = 0
              let tempObj = {}
              counts[el1].flatMap((el2, i) => {
                const tempKey = el2?.fromTime.padStart(2, '0');
                temp++
                tempObj[tempKey] = temp
              })
              resultObj.push({ [days[dates.indexOf(el)]]: { ...tempory1[el], ...tempObj } });
            }
          })
          return [...resultObj1, ...resultObj]
        })

        const interm = {}
        result.flat(4).map(el=>{
          const [key] = Object.entries(el)
          interm[key[0]]= key[1];
        })
        
        return res.json(interm);
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
    const company = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
      populate: {
        path: "reservation.booking",
        populate: [{ model: "Seats", path: "seatBook" }],
      },
    })
    const offices = await Office.find({ slug: company.slug }).populate({
      path: "floors", populate: {
        path: "Seats",
      },
    })
    const weekfilter = async () => {

      const arr = ["one_seater", "two_seater", "four_seater", "six_seater", "eight_seater", "ten_seater"];


      if (company.profile.length > 0) {
        const temp = company.profile.map(el => {
          return el.reservation.booking.map(el1 => {
            return { seatId: el1.seatBook.id, seatName: el1.seat, type: el1?.seatBook?.seats[0][el1?.seat]?.type }
          })
        }).flat(4)

        let temp2 = offices.map(el => {
          return el.floors.map(el1 => {
            if (el1?.Seats?.seats)
              return Object.values(el1?.Seats?.seats[0]);
          })
        })
        temp2 = temp2.flat(4).filter(el => el != undefined).filter(d => arr.includes(d.type))
        const totalSeating = temp2.length
        const singleSeat = parseInt((temp.filter(d => d.type == "one_seater").length / totalSeating) * 100)
        const twoSeat = parseInt((temp.filter(d => d.type == "two_seater").length / totalSeating) * 100)
        const fourSeat = parseInt((temp.filter(d => d.type == "four_seater").length / totalSeating) * 100)
        const sixSeat = parseInt((temp.filter(d => d.type == "six_seater").length / totalSeating) * 100)
        const eightSeat = parseInt((temp.filter(d => d.type == "eight_seater").length / totalSeating) * 100)
        const tenSeat = parseInt((temp.filter(d => d.type == "ten_seater").length / totalSeating) * 100)


        return res.json({ conference: twoSeat + fourSeat + sixSeat + eightSeat + tenSeat, singleDesk: singleSeat, twoseater: twoSeat, fourseater: fourSeat, sixseater: sixSeat, eightseater: eightSeat, tenseater: tenSeat });

      } else {
        return res.json({ res: "No data Found" });
      }
    }

    const monthfilter = async () => { }

    const customfilter = async (from, to) => {

      const startOfDate = moment(from);
      const endOfDate = moment(to);
      console.log(startOfDate, endOfDate);

    }


    switch (term) {
      case "month":
        await monthfilter()
        break;
      case "custom":
        await customfilter(from, to)
        break;
      default:
        await weekfilter()
        break;
    }

  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.timeUtilization = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const weekRange = [];
    const count = {}
    const result = {}
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

      const startday001 = company.officeConfigure?.WeekDayFrom ? dates[days.indexOf(company.officeConfigure?.WeekDayFrom)] : null
    const endday001 = company.officeConfigure?.WeekDayTo ? dates[days.indexOf(company.officeConfigure?.WeekDayTo)] : null

    const startOfWeek1 = moment(startday001 ?? (new Date()).toISOString()).clone().startOf('week')
    const endOfWeek1 = moment(endday001 ?? (new Date()).toISOString()).clone().endOf('week')

    const starttime001 = company.officeConfigure?.TimeFrom ? company.officeConfigure?.TimeFrom : null
    const endtime001 = company.officeConfigure?.TimeTo ? company.officeConfigure?.TimeTo : null

    const startTiming = moment(starttime001 ?? "00:00:00", "HH:mm:ss").format("HH")
    const endTiming = moment(endtime001 ?? "23:00:00", "HH:mm:ss").format("HH")

    console.log(endTiming, startTiming, endOfWeek1, startOfWeek1);

    const totalTimeInweek = (parseInt(endTiming) - parseInt(startTiming)) * (moment(endOfWeek1, "MM/DD/YYYY").diff(moment(startOfWeek1, "MM/DD/YYYY"), 'days') + 1)

    if (company.profile.length > 0) {

      let temp = company.profile.flatMap(el => {
        return el?.reservation?.booking.map(el1 => {
          return ({ info: moment.duration(moment(el1.desk.toTime, 'HH:mm:ss a').diff(moment(el1.desk.fromTime, 'HH:mm:ss a'))), name: el1.seat });
        })
      }).flat(4)

      temp = temp.filter(el => (moment(el.info.dateFrom).isBetween(startOfWeek1, endOfWeek1)))
      

      temp.map(el => {
        count[el.name] = count[el.name] ? count[el.name] + Math.abs(parseInt(el.info.asHours())) : Math.abs(parseInt(el.info.asHours()))
      })
    
      for (let [key, value] of Object.entries(count)) {
        result[key] = {
          deskAvaiPercent: parseInt(((totalTimeInweek - value) / totalTimeInweek) * 100),
          deskBookPercent: parseInt((value / totalTimeInweek) * 100),
          deskAvaiTime: parseInt(totalTimeInweek - value),
          deskBookTime: parseInt(value),
        }
      }

      return res.json(result);
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.topBootomDesk = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const weekRange = [];
    const newSet = new Set()
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
        populate: [{ model: "Seats", path: "seatBook" }],
      },
    }).populate({ path: "officeConfigure" });

    const startOfWeek1 = moment(dates[days.indexOf(company.officeConfigure?.WeekDayFrom)] ?? (new Date()).toISOString()).clone().startOf('week')
    const endOfWeek1 = moment(dates[days.indexOf(company.officeConfigure?.WeekDayTo)] ?? (new Date()).toISOString()).clone().endOf('week')


    if (company.profile.length > 0) {

      let temp = company.profile.flatMap(el => {
        return el?.reservation?.booking.map(el1 => {
          newSet.add(el1.seat)
          return ({ info: Math.abs(parseInt(moment.duration(moment(el1.desk.toTime, 'HH:mm:ss a').diff(moment(el1.desk.fromTime, 'HH:mm:ss a'))).asHours())), name: el1.seat, img: el1?.seatBook?.seats[0][el1?.seat]?.image });
        })
      }).flat(4)

      temp = temp.filter(el => (moment(el.info.dateFrom).isBetween(startOfWeek1, endOfWeek1)))
      const seatImage = {}
      let checking = [...newSet].map(el => {
        let increment = 0
        let timeHour = 0
        temp.map(el1 => {
          if (el == el1.name) {
            seatImage[el1.name] = (el1.img)
            increment++
            timeHour += el1.info
          }
        })
        return { name: el, timeHour: timeHour, bookingFreq: increment }
      })
      checking = checking.map(el => {
        return { ...el, img: seatImage[el.name] };
      })
      const result = checking.sort((a, b) => b.timeHour - a.timeHour)

      return res.json({ top: result.slice(0, 5), bottom: result.slice(-5) });
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.shows = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const weekRange = [];
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

    const startOfWeek1 = moment(dates[days.indexOf(company.officeConfigure?.WeekDayFrom)] ?? (new Date()).toISOString()).clone().startOf('week')
    const endOfWeek1 = moment(dates[days.indexOf(company.officeConfigure?.WeekDayTo)] ?? (new Date()).toISOString()).clone().endOf('week')

    if (company.profile.length > 0) {
      let temp = company.profile.flatMap(el => {
        const deskResult = el?.reservation?.booking.map(el1 => {
          return el1.desk
        })
        return { userName: `${el?.firstName} ${el?.lastName}`, dp: el?.dp, desk: deskResult }
      })

      temp = temp.map(el => {
        const newDesk = el.desk.filter(el1 => (moment(el1.dateFrom).isBetween(startOfWeek1, endOfWeek1)))
        return { userName: el.userName, dp: el?.dp, desk: newDesk }
      })

      temp = temp.map(el => {
        const booking = el?.desk.filter(el1 => el1.booked)
        const noShowing = el?.desk.filter(el1 => el1.cancelled)
        const { userName, dp } = (el);
        return { userName, dp, noofbooking: booking.length, noofnoshow: noShowing.length }
      })
      return res.json(temp);
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}
exports.userDetailInfo = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf('week');
    const today = moment()
    const weekRange = [];
    const newSet = new Set()
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

    const startOfWeek1 = moment(dates[days.indexOf(company.officeConfigure?.WeekDayFrom)] ?? (new Date()).toISOString()).clone().startOf('week')
    const endOfWeek1 = moment(dates[days.indexOf(company.officeConfigure?.WeekDayTo)] ?? (new Date()).toISOString()).clone().endOf('week')

    const startTiming = moment(company.officeConfigure?.TimeFrom ?? "00:00:00", "HH:mm:ss").format("HH")
    const endTiming = moment(company.officeConfigure?.TimeTo ?? "24:00:00", "HH:mm:ss").format("HH")

    const totalTimeInweek = (parseInt(endTiming) - parseInt(startTiming)) * (moment(endOfWeek1, "MM/DD/YYYY").diff(moment(startOfWeek1, "MM/DD/YYYY"), 'days') + 1)

    if (company.profile.length > 0) {

      let temp = company.profile.flatMap(el => {
        const { firstName, lastName, dp, department } = el
        const bookings = el?.reservation?.booking.map(el1 => el1)
        let timespent = bookings.filter(el1 => (moment(el1.desk.dateFrom).isBefore(today)))
        let timeremaing = bookings.filter(el1 => (moment(el1.desk.dateFrom).isBetween(today, endOfWeek1)))

        timespent = timespent.reduce((acc, curr) => Math.abs(parseInt(moment.duration(moment(curr?.desk?.toTime, 'HH:mm:ss a').diff(moment(curr?.desk?.fromTime, 'HH:mm:ss a'))).asHours())), 0
        )
        timeremaing = timeremaing.reduce((acc, curr) => Math.abs(parseInt(moment.duration(moment(curr?.desk?.toTime, 'HH:mm:ss a').diff(moment(curr?.desk?.fromTime, 'HH:mm:ss a'))).asHours())), 0
        )
        return { userName: `${firstName} ${lastName}`, dp: dp, department: department, booked: bookings.length, timespent: timespent, timeremaing: timeremaing, }
      }).flat(4)

      temp = temp.sort((a, b) => b.booked - a.booked)

      return res.json({ result: temp, totalTime: totalTimeInweek });
    } else {
      return res.json({ res: "No data Found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}