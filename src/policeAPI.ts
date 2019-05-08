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

  // TODO: Test this by drawing a box round each bbox returned by this
  const splitBoundingBox = (boundingBox: any, numberToSplitBy: number): any => {
    if (numberToSplitBy === 0) return [boundingBox];
    const [ left, top, right, bottom ] = boundingBox;
    const xGap = right - left;
    const yGap = top - bottom;
    const middleX = left + xGap / 2;
    const middleY = bottom + yGap / 2;

    return [
      splitBoundingBox([left, top, middleX, middleY], numberToSplitBy - 1), // top left
      splitBoundingBox([middleX, top, right, middleY], numberToSplitBy - 1), // top right
      splitBoundingBox([left, middleY, middleX, bottom], numberToSplitBy - 1), // bottom left
      splitBoundingBox([middleX, middleY, right, bottom], numberToSplitBy - 1), // bottom right
    ];

  };

  const formattedMonth = (month + 1).toString().padStart(2, '0');
  const getQ1BBox = (array: any): any => {
    if (! Array.isArray(array[0])) return array;
    return getQ1BBox(array[0]);
  }
  

  let isGood = false;
  let i = 0;
  let boundingBoxArray
  while (!isGood) {
    boundingBoxArray = splitBoundingBox(bbox, i);
    console.log(boundingBoxArray);
    const boundingBoxQ1 = getQ1BBox(boundingBoxArray);
    const { lngMiles, latMiles } = getMilesFromLatLngs(boundingBoxQ1);
    console.log(lngMiles, latMiles);
    if (lngMiles < 7 && latMiles < 7) break;
    i++;
    if (i === 5) break;
  }

  console.log(boundingBoxArray);


  // return getData(bbox);

}