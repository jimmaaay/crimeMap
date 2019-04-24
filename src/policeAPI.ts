import haversine from 'haversine';

export const getCrimesByBbox = (bbox: any, { month, year }: any) => {

  const points = [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[1]],
    [bbox[2], bbox[3]],
    [bbox[0], bbox[3]],
  ];
  
  const xStart = { longitude: bbox[0], latitude: bbox[1] };
  const xEnd = { longitude: bbox[2], latitude: bbox[1] };
  const yStart = { longitude: bbox[0], latitude: bbox[1] };
  const yEnd = { longitude: bbox[0], latitude: bbox[3] };

  const lngMiles = haversine(xStart, xEnd, { unit: 'mile' });
  const latMiles = haversine(yStart, yEnd, { unit: 'mile' });

  console.log(lngMiles, latMiles);

  if (lngMiles > 8 || latMiles > 8) {
    console.warn('Should cut up into segments');
  }

  const poly = points.map(([ lng, lat ]) => {
    return `${lat},${lng}`
  }).join(':');

  const formattedMonth = (month + 1).toString().padStart(2, '0');
  const endpoint = 'https://data.police.uk/api/crimes-street/all-crime';
  const searchParams = new URLSearchParams({
    poly,
    date: `${year}-${formattedMonth}`,
  });

  return fetch(`${endpoint}?${searchParams.toString()}`)
    .then(_ => _.json())

}