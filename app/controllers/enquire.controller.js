const db = require("../models");
const { sendMail } = require("../config/mailer");
const Enquire = db.enquire;
exports.createEnquire = async(req, res) => {
  const {companyName, name, phone, email, query} = req.body
  const enquery = new Enquire({
    companyName,
    name,
    phone,
    email,
    query
  });
  enquery.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    } 
  })

  await sendMail(
    email,
    "Hydesq – New enquiery",
    null,
    `${email} phone: ${phone} quried ${query}`,
    null
  );

  res.status(200).send("Enquery created successfully...");
};

