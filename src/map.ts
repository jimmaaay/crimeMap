import * as mapboxgl from 'mapbox-gl';
import { LngLatBoundsLike } from 'mapbox-gl';
import markerUrl from './marker.png';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;


interface MapMarker {
  lat: any;
  lng: any;
}

export default async () => {
  const canvas = new (window as any).OffscreenCanvas(480, 480);
  const ctx = canvas.getContext('2d');
  const image = new Image();

  const markerData: any = await new Promise((resolve) => {
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      // resolve(canvas.convertToBlob());
      const imageData = ctx.getImageData(0, 0, 480, 480);
      resolve(imageData);
      // resolve(new Blob([imageData.data], { type: 'image/png' }));
      // resolve(imageData);
    }

    image.src = markerUrl;
  });

  const data = markerData;


  // const redMarkerData = new Uint8ClampedArray(markerData.);
  // for (let i = 0; i < redMarkerData.length; i = i + 4) {
  //   const r = redMarkerData[i];
  //   // const g = redMarkerData[i + 1];
  //   // const b = redMarkerData[i + 2];
  //   const a = redMarkerData[i + 3];

  //   if (a !== 0) redMarkerData[i] = 255;
  // }

  // const blob = new Blob([new Uint8Array(markerData.data)], { type: 'image/png' });

  // const url = window.URL.createObjectURL(markerData);
  // console.log(url);
  

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 5,
    center: [ // mapbox puts lng then lat
      -4.259816,
      54.620976,
    ],
  });

  map.addImage('gradient', {width: 480, height: 480, data: data});

  (window as any).map = map;

  const drawBox = (coordinates: any[]) => {

    const layerExists = map.getLayer('bbox') !== undefined;
    const source = map.getSource('bbox') as mapboxgl.GeoJSONSource || undefined;
    const sourceData: any = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  
    if (source === undefined) {
      const bboxSource: any = {
        type: 'geojson',
        data: sourceData,
      };

      map.addSource('bbox', bboxSource);
    } else {
      source.setData(sourceData)
    }

    if (!layerExists) {
      map.addLayer({
        id: 'bbox',
        type: 'line',
        source: 'bbox',
        layout: {},
        paint: {
          'line-color': '#088',
        },
      });
    }

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

    const layerExists = map.getLayer('markers') !== undefined;
    const source = map.getSource('markers') as mapboxgl.GeoJSONSource || undefined;
    const markerSourceData: any = {
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
    };

    if (source === undefined) {
      const markerSource: any = {
        type: 'geojson',
        data: markerSourceData,
      };
      map.addSource('markers', markerSource);
    } else {
      source.setData(markerSourceData);
    }

    if (!layerExists) {
      map.addLayer({
        id: 'markers',
        type: 'symbol',
        source: 'markers',
        layout: {
          'icon-image': 'gradient',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

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