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
      book: [
        {
          bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
          },
          reedemInfo: [
            {
              vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Vendor",
              },
              promotionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Promotion",
              },
            },
          ],
          bookedTime: {
            type: mongoose.Schema.Types.Mixed,
          },
          coins: { type: Number, default: 0 },
          coinsSpent: { type: Number, default: 0 },
        },
      ],
    },
    { minimize: false, strict: false }
  )
);

module.exports = LeaderBoard;
