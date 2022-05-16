const pdf = require("pdf-creator-node");
var parse = require("csv-parse");
const fs = require("fs");
const moment = require("moment");

const options = {
  format: "A3",
  orientation: "landscape",
  border: "10mm",
  header: {
    height: "20mm",
    contents: '<div style="text-align: center;">Author: Green Universe</div>',
  },
};

const exporter = async (data, path, name) => {
  try {
    data["exportedAt"] = `${moment().utc().format("YYYY-MM-DD HH:mm")} UTC`;
    // Read HTML Template

    let html = fs.readFileSync(path, "utf8");
    let document = {
      html: html,
      data: {
        data,
      },
      path: `server/config/exportedFiles/${name}.pdf`,
      type: "",
    };

    const pdfPath = await pdf.create(document, options);
    return pdfPath;
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
