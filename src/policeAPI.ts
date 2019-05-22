import haversine from 'haversine';

const ENDPOINT = 'https://data.police.uk/api/crimes-street/all-crime';


// TODO: Test this by drawing a box round each bbox returned by this
export const splitBoundingBox = (boundingBox: any, numberToSplitBy: number): any => {
  if (numberToSplitBy === 0) return boundingBox;
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
      [boundingBox[0], boundingBox[1]],
      [boundingBox[2], boundingBox[1]],
      [boundingBox[2], boundingBox[3]],
      [boundingBox[0], boundingBox[3]],
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
    const boundingBoxQ1 = getQ1BBox(boundingBoxArray);
    const { lngMiles, latMiles } = getMilesFromLatLngs(boundingBoxQ1);
    if (lngMiles < 7 && latMiles < 7) break;
    i++;
  }

  let flattenedBoundingBoxes = boundingBoxArray.flat(i - 1);
  if (! Array.isArray(flattenedBoundingBoxes[0])) {
    flattenedBoundingBoxes = [flattenedBoundingBoxes];
  }

  console.log(bbox);
  console.log(flattenedBoundingBoxes);

  // flattenedBoundingBoxes.forEach(([left, top, right, bottom]) => {
  //   setTimeout(() => {
  //     window.drawThingyBox(left, top, right, bottom);
  //   }, 1000);
  // });

  const allQuadrants = Promise.all(
    flattenedBoundingBoxes.map((fbbox) => getData(fbbox))
  ).then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  })

  // console.log(flattenedBoundingBoxes);
  // console.log(flattenedBoundingBoxes);


  // return getData(bbox);

}