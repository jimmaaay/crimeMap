import haversine from 'haversine';
import pMap from 'p-map';

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

  const getData = (boundingBox: any): any => {
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


  const mapper = (arg1: boolean | number[], arg2: number[] | number): any => {
    const boundingBox = typeof arg1 === 'boolean' ? arg2 : arg1;
    const isNestedMapper = arg1 === true;
  
    return getData(boundingBox)
      .catch(async (err: Error) => {
        // Seem to get 503 errors when there is too much crime in an area
        if (!isNestedMapper && err.message === '503') {
          const nestedMapper = mapper.bind(this, true);
          const splitQuadrant = splitBoundingBox(boundingBox, 1);
          const quadrantData = await pMap(splitQuadrant, mapper, { concurrency: 2 });
          return (quadrantData as any).flat();
        }
        return [];
      });
  };

  return pMap(flattenedBoundingBoxes, mapper, { concurrency: 3 })
    .then((data: any) => data.flat())
    .catch((err) => console.log(err));

}