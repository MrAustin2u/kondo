const fs = require("fs");
const path = require("path");
const scriptName = process.argv[3];
const inputURL = process.argv[4];
const { Runs } = require("../models/models");

const trimScript = (input) => {
  // remove first two lines containing URL and viewport info, replace blank lines with semicolons
  let newString = input.slice(input.indexOf(`}`) + 3).replace(/\)\n/g, ");");
  // build an object containing the url and sanitized puppeteer script
  return `exports.${scriptName} = {
  url: '${inputURL}',
  func: async (page) => {${newString}  }
}

`;
};

const scriptController = {};

scriptController.postHeaps = (req, res, next) => {
  console.log(`IN postHeaps`);
  Runs.create(
    {
      heapUsageOverTime: req.body.heapUsageOverTime,
      memoryLeaks: req.body.memoryLeaks,
    },
    (err, postHeap) => {
      if (err) {
        console.log(`Error in databaseController.postHeaps`);
        res.sendStatus(418);
        return next();
      } else {
        console.log(`I am inside of else statement for postHeaps`);
        res.locals.heapUsageOverTime = postHeap.heapUsageOverTime;
        res.locals.memoryLeaks = postHeap.memoryLeaks;
        return next();
      }
    }
  );
};

scriptController.storeScript = (req, res, next) => {
  // call helper function to process and return new script string
  let newScript = trimScript(req.body.code);
  // add the object locally to the userscripts file
  fs.appendFile(
    path.join(__dirname, "../userscripts.js"),
    newScript,
    "utf-8",
    function(err) {
      if (err) next(err);
      console.log(
        `Saved successfully! You can run this test by entering "npm start -- run ${scriptName}"`
      );
      next();
    }
  );
};

module.exports = scriptController;
