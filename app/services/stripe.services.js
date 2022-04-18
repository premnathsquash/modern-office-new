const db = require("../models");
const User = db.user;
exports.resetUserDb = async(id)=>{
  
  const user = await User.findOne({
    stripeSubscriptionId: id,
  })
  console.log("check",user);
  

}
