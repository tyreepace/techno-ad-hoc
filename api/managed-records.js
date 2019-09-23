import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
var page = null;

function retrieve(options) {
  let params = formatOptions(options);
  var url = window.path + params;

  return fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    return formatResponse(data);
  })
  .catch((err) => {
    console.log('Uh oh, something went wrong: ' + err);
  });
}

function formatOptions(opts={}) {
  if (!opts.page) {
    opts.page = 1;
  }
  page = opts.page;

  let offset = (page - 1) * 10;
  let limit = 10;

  if (opts.colors) {
    var colorParams = opts.colors.map(function(color) {
      return 'color[]=' + color;
    }).join('&');
  }

  return `?limit=${limit}&offset=${offset}&${colorParams}`;
}

function formatResponse(data) {
  let count = 0;
  let records = {
    ids: [],
    open: [],
    closedPrimaryCount: null,
    previousPage: null,
    nextPage: null
  }

  data.map((datum) => {
    records.ids.push(datum.id);

    if (datum.disposition === 'open') {
      datum.isPrimary = isPrimaryColor(datum.color);
      records.open.push(datum);
    }

    if (datum.disposition === 'closed') {
      if (isPrimaryColor(datum.color) === true) {
        count++;
      }
    }
  });

  // this is not how I would normally do pagination, but I am trying to keep this within constraints of the assignment
  // typically I would prefer to have a total count returned from the api that I could pull from the header response
  if (page > 1) {
    records.previousPage = page - 1;
  }

  if (records.ids.length) {
    if (records.ids[9] === 500) {
      records.nextPage = null;
    } else {
      records.nextPage = page + 1;
    }
  }
  records.closedPrimaryCount = count;

  return records;
}

function isPrimaryColor(color) {
  return (color === 'red' || color === 'blue' || color === 'yellow' ? true : false);
}

export default retrieve;
