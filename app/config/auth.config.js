require("dotenv").config()
console.log(process.env.secret);

module.exports = {
  secret: process.env.secret
};

