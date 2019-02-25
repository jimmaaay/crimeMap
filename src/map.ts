import * as mapboxgl from 'mapbox-gl';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;

export default () => {

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 5,
    center: [ // mapbox puts lng then lat
      -4.259816,
      54.620976,
    ],
  });

  (window as any).map = map;

  const drawBox = (id: string, coordinates: any[]) => {

    map.addLayer({
      id,
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }
      },
      layout: {},
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.8
      },
    });

  }


  return {
    drawBox,
  };

}