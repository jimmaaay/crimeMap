const getRequestEndpoint = (search: string) => {
  const endpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
  return `${endpoint}${search}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
}

console.log(getRequestEndpoint('Chichester'));

