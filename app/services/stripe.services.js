const db = require("../models");
const User = db.user;
exports.resetUserDb = async(id)=>{ 
  const user = await User.findOne({
    stripeSubscriptionId: id,
  })
  await User.findOneAndUpdate({_id: user._id}, {...user, stripeProductPrice: null, stripeSubscriptionId: "" }, async (err, profile1) => {
    if (err) {
      return { message: err };
    }
  //
  })
  

}
