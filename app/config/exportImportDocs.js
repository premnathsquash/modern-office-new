require("dotenv").config()

const aws = require("aws-sdk");
const PDFDocument = require('pdfkit');
const parse = require("csv-parse");
const fs = require('fs');
const fs1 = require('fs').promises;
const path = require('path')

const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const REGION = process.env.REGION;

aws.config.update({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
  region: REGION,
});

const s3 = new aws.S3();

const createPdf = async (data, fileName) => {
  try {
    const doc = new PDFDocument({ size: 'A4' });
    const appDir = path.dirname(require.main.filename);
    let writeStream = fs.createWriteStream(`${appDir}/${fileName}.pdf`)
    doc.fontSize(25).text(data, 100, 100);
    doc.save()
    doc.pipe(writeStream);
    doc.end();

    writeStream.on('finish', async (err) => {
      if (err) {
        console.log("file creatation failed", err);
      }
      const data = await fs1.readFile(`${appDir}/${fileName}.pdf`);
      const params = {
        Key: `${fileName}`,
        Body: Buffer.from(data),
        Bucket: "gu-export-files",
        ContentType: 'application/pdf',
      }
      s3.upload(params).promise()
      fs.unlink(`${appDir}/${fileName}.pdf`, (err12) => { })

    })
    return `https://gu-export-files.s3.ap-southeast-2.amazonaws.com/${fileName}`

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
  createPdf,
};
