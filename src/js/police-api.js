import 'whatwg-fetch';

const endpoint = "https://data.police.uk/api/crimes-street/all-crime";
let queries = {}; // used to cache responses

export function getData(obj) {
  const {
    date,
    poly,
    callback
  } = obj;
  const query = `?poly=${poly}&date=${date}`;

  if (!queries.hasOwnProperty(query)) {
    fetch(endpoint + query)
      .then(function(res) {
        if (res.status === 200) {
          return res.json();
        } else {
          return {
            status: res.status,
            statusText: res.statusText
          }
        }
      })
      .then(function(data) {
        queries[query] = [null, data];
        callback(null, data);
      })
      .catch(function(err) {
        queries[query] = [err];
        callback(err);
      });
  }
  else{
    callback.apply(null, queries[query]);
  }
}

export function lastUpdated(callback) {

  fetch("https://data.police.uk/api/crime-last-updated")
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      callback(null, data);
    })
    .catch(function(err) {
      callback(err);
    });

}
