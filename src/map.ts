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

  const drawBox = (coordinates: any[]) => {

    const layerExists = map.getLayer('bbox') !== undefined;
    const sourceExists = map.getSource('bbox') !== undefined;

    if (layerExists) map.removeLayer('bbox');
    if (sourceExists) map.removeSource('bbox');

    map.addLayer({
      id: 'bbox',
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
   * TODO: Properly add click handler 
   * @see https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/
   * 
   * Using unusual method for adding markers as its more performant
   * @see https://stackoverflow.com/a/44360081
   */
  const setMarkers = (markers: MapMarker[]) => {

    const markerLayer: any = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: markers.map(({ lat, lng }) => {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
          };
        }),
      },
    };

    const layerExists = map.getLayer('markers') !== undefined;
    const sourceExists = map.getSource('markers') !== undefined;

    if (layerExists) map.removeLayer('markers');
    if (sourceExists) map.removeSource('markers');

    map.addSource('markers', markerLayer);

    map.addLayer({
      id: 'markers',
      type: 'symbol',
      source: 'markers',
      layout: {
        'icon-image': 'car-15',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });

    map
      .on('click', 'markers', (e) => {
        console.log(e);
      })
      .on('mouseenter', 'markers', () => {
        map.getCanvas().style.cursor = 'pointer';
      })
      .on('mouseleave', 'markers', () => {
        map.getCanvas().style.cursor = '';
      });

  }


  return {
    drawBox,
    fitBounds,
    setMarkers,
  };

}