import haversine from 'haversine';

const ENDPOINT = 'https://data.police.uk/api/crimes-street/all-crime';

export const getCrimesByBbox = async (bbox: any, { month, year }: any) => {

  const getMilesFromLatLngs = (boundingBox: any) => {
    const xStart = { longitude: boundingBox[0], latitude: boundingBox[1] };
    const xEnd = { longitude: boundingBox[2], latitude: boundingBox[1] };
    const yStart = { longitude: boundingBox[0], latitude: boundingBox[1] };
    const yEnd = { longitude: boundingBox[0], latitude: boundingBox[3] };
    const lngMiles = haversine(xStart, xEnd, { unit: 'mile' });
    const latMiles = haversine(yStart, yEnd, { unit: 'mile' });

    return {
      lngMiles: haversine(xStart, xEnd, { unit: 'mile' }),
      latMiles: haversine(yStart, yEnd, { unit: 'mile' }),
    };
  }

  const getData = (boundingBox: any) => {
    const points = [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[1]],
      [bbox[2], bbox[3]],
      [bbox[0], bbox[3]],
    ];
    const poly = points.map(([ lng, lat ]) => {
      return `${lat},${lng}`
    }).join(':');
  
  
    const searchParams = new URLSearchParams({
      poly,
      date: `${year}-${formattedMonth}`,
    });

    return fetch(`${ENDPOINT}?${searchParams.toString()}`)
      .then((response) => {
        if (response.status !== 200) throw new Error(response.status.toString());
        return response.json();
      });
  };

  const splitBoundingBox = (boundingBox: any, numberToSplitBy: number) => {
    if (numberToSplitBy === 0) return boundingBox;
    const [ left, top, right, bottom ] = boundingBox;
    const middleX = right - left / 2;
    const middleY = top - bottom / 2;
    
    // const newBboxArray = righ
  };
  
  
  const formattedMonth = (month + 1).toString().padStart(2, '0');
  

  let isGood = false;
  let i = 0;
  while (!isGood) {
    const boundingBox = splitBoundingBox(bbox, i);
    const { lngMiles, latMiles } = getMilesFromLatLngs(bbox);
    i++;
    // if (lngMiles )
  }


  // return getData(bbox);

}