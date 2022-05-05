const mongoose = require("mongoose");

const OfficeConfigure = mongoose.model(
  "OfficeConfigure",
  new mongoose.Schema(
    {
      WeekDayFrom: { type: String, default: "" },
      WeekDayTo: { type: String, default: "" },
      TimeFrom: { type: String, default: "" },
      TimeTo: { type: String, default: "" },
      hotDeskSetup: {
        DeskBookingTime: { type: Boolean, default: false },
        ReportAnalysisTime: { type: Boolean, default: false },
        AllocatedSeating: { type: Boolean, default: false },
      },
      capacity: {
        AllowUpto50PerOccu: { type: Boolean, default: false },
        AllowUpto80PerOccu: { type: Boolean, default: false },
        AllowUpto100PerOccu: { type: Boolean, default: true },
      },
    },
    { strict: false }
  )
);

module.exports = OfficeConfigure;
