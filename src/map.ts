import * as mapboxgl from 'mapbox-gl';
import { LngLatBoundsLike } from 'mapbox-gl';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;


interface MapMarker {
  lat: any;
  lng: any;
}

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
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }
      } as any,
      layout: {},
      paint: {
        // 'fill-color': '#088',
        // 'fill-opacity': 0.8
        'line-color': '#088',
        // 'line-opacity': 0.8,
      },
    });

  }

  /**
   * Will center and zoom the map based on the bounding box
   */
  const fitBounds = (bbox: LngLatBoundsLike) => {
    map.fitBounds(bbox, {
      padding: 50,
    });
  }

  /**
   * Will add an array of markers to the map. 
   * 
   * TODO: Should either look at implementing clusters https://docs.mapbox.com/mapbox-gl-js/example/cluster/
   * or batch add the markers, e.g 10 at a time
   */
  const addMarkers = (markers: MapMarker[]) => {

    markers.forEach(({ lat, lng }) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
    });

  }


  return {
    drawBox,
    fitBounds,
    addMarkers,
  };

}