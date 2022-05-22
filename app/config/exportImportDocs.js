require("dotenv").config()

const aws = require("aws-sdk");
const PDFDocument = require('pdfkit');
const parse = require("csv-parse");

const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const REGION = process.env.REGION;

aws.config.update({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
  region: REGION,
});

const s3 = new aws.S3();

const exporter = async (data, fileName) => {
  try {
    const doc = new PDFDocument();

    doc.text("Text for your PDF");
    doc.end();

    const params = {
      key: fileName,
      body: doc,
      bucket: 'gu-export-files',
      contentType: 'application/pdf',
      ACL: "public-read-write"
    }
    s3.upload(params, function (err, response) {
      if (err) {
        console.log(err);
      }
      return ("fileuploaded");

    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const importer = async (file) => {
  const csvData = [];
  fs.createReadStream(file)
    .pipe(parse({ delimiter: ":" }))
    .on("data", function (csvrow) {
      csvData.push(csvrow);
    })
    .on("end", function () {
      console.log(csvData);
    });
  return csvData;
};

module.exports = {
  importer,
  exporter,
};
