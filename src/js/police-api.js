const endpoint = "https://data.police.uk/api/crimes-street/all-crime";

export function getData(obj) {
  const { date, poly, callback } = obj;

  fetch(endpoint +`?poly=${poly}&date=${date}`)
  .then(function(res) {
    if(res.status === 200){
      return res.json();
    }
    else{
      return {
        status:res.status,
        statusText:res.statusText
      }
    }
  })
  .then(function(data) {
    callback(null, data);
  })
  .catch(function(err) {
    callback(err);
  });
}

export function lastUpdated(callback){

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
