const db = require("../../models");
const { sendMail } = require("../../config/mailer");
const Enquire = db.enquire;
const User = db.user;
exports.createEnquire = async (req, res) => {
  const { companyName, name, phone, email, query } = req.body;
  let customerType;
  const enquery = new Enquire({
    companyName,
    name,
    phone,
    email,
    query,
  });
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) {
      customerType = "New";
    } else {
      customerType = "Existing";
    }

    enquery.customerType = customerType;
    enquery.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    });
  });

  await sendMail(
    email,
    "Hydesq – New enquiery",
    null,
    `${email} phone: ${phone} quried ${query}`,
    null
  );

  res.status(200).send("Enquery created successfully...");
};
exports.listEnquire = async(req, res)=>{
  const enquires = await Enquire.find({})
  return res.status(200).send(enquires)
}