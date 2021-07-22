const fs = require("fs");
const moment = require("moment");
const _ = require("lodash");

// Here this code is assuming that clicks are sorted by timestamp

/*
    Here first we discard clicks if there are more than 10 clicks for an IP
    then creating a map of size 24 as there are 24 hours in a day. In this map key is hour and
    value is an object with key ip and value object with amount and timestamp.
    after creating this map, constructing a result set from that map.
    In worst case when all clicks are unique complexity would be O(n)*24 which is O(n) as 24 is constant
    otherwise complexity would be less than O(n).
*/

const getSubsetOfClicks = (clicks) => {
  const tempObj = {};
  clicks
    .filter((click) => _.get(click, "amount") <= 10) // discard If there are more than 10 clicks for an IP
    .forEach((item) => {
      const getHour = moment(new Date(_.get(item, "timestamp")))
        .hour()
        .toString();
      if (tempObj[getHour]) {
        if (tempObj[getHour][item.ip]) {
          if (tempObj[getHour][item.ip].amount < _.get(item, "amount")) {
            tempObj[getHour][item.ip].amount = _.get(item, "amount");
            tempObj[getHour][item.ip].timestamp = _.get(item, "timestamp");
          }
        } else {
          tempObj[getHour][item.ip] = {
            timestamp: _.get(item, "timestamp"),
            amount: _.get(item, "amount"),
          };
        }
      } else {
        const obj = {};
        obj[item.ip] = {
          timestamp: _.get(item, "timestamp"),
          amount: _.get(item, "amount"),
        };
        tempObj[getHour] = obj;
      }
    });

  // Now construct final response by iterating the temp object
  return Object.keys(tempObj).flatMap((key) => {
    return Object.keys(tempObj[key]).map((element) => ({
      ip: element,
      ...tempObj[key][element],
    }));
  });
};

(function () {
  const clicks = fs.readFileSync("./clicks.json").toString();
  if (clicks.length) {
    const subsetOfClicks = getSubsetOfClicks(JSON.parse(clicks));
    fs.writeFileSync(
      "resultset.json",
      JSON.stringify(subsetOfClicks),
      (err) => {
        if (err) throw err;
      }
    );
  } else {
    console.log("No Clicks Found");
  }
})();
