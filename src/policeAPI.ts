export const getCrimesByBbox = (bbox: any, { month, year }: any) => {

  const points = [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[1]],
    [bbox[2], bbox[3]],
    [bbox[0], bbox[3]],
  ];

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