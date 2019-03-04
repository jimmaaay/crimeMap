export const getCrimesByBbox = (bbox: any) => {

  const points = [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[1]],
    [bbox[2], bbox[3]],
    [bbox[0], bbox[3]],
  ];

  const poly = points.map(([ lng, lat ]) => {
    return `${lat},${lng}`
  }).join(':')


  const endpoint = 'https://data.police.uk/api/crimes-street/all-crime';
  const searchParams = new URLSearchParams({
    poly,
  });

  return fetch(`${endpoint}?${searchParams.toString()}`)
    .then(_ => _.json())

}