const mongoose = require("mongoose");

const LeaderBoard = mongoose.model(
  "LeaderBoard",
  new mongoose.Schema(
    {
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
      consecutiveDays: {
        type: Number,
        default: 0
      },
      book: [
        {
          bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
          },
          bookedTime: {
            type: mongoose.Schema.Types.Mixed,
          },
          coins: { type: Number, default: 0 },
        },
      ],
    },
    { minimize: false, strict: false }
  )
);

module.exports = LeaderBoard;
