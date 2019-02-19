import * as mapboxgl from 'mapbox-gl';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  zoom: 5,
  center: [ // mapbox puts lng then lat
    -4.259816,
    54.620976,
  ],
});