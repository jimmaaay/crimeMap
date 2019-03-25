import * as mapboxgl from 'mapbox-gl';
import { LngLatBoundsLike } from 'mapbox-gl';
import markerUrl from './marker.png';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;


interface MapMarker {
  lat: any;
  lng: any;
  category: string;
}

const createColouredMarker = (
  image: HTMLImageElement,
  colour: string
) => {
  const { width, height } = image;
  const canvas = new (window as any).OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, width, height);

  const imageData: ImageData = ctx.getImageData(0, 0, width, height);
  return {
    width,
    height,
    imageData,
  };
}

export default async () => {
  const image = new Image();
  let imageLoaded = false;
  image.onload = () => imageLoaded = true;
  image.src = markerUrl;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 5,
    center: [ // mapbox puts lng then lat
      -4.259816,
      54.620976,
    ],
  });

  const existingMarkers: string[] = [];

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
    const categories = markers.map(({ category }) => category);
    const categoryMarkers = [ ...new Set(categories) ];

    const markerCategoriesToAdd = categoryMarkers
      .filter((category) => !existingMarkers.includes(category)); 

    markerCategoriesToAdd.forEach((category) => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);

      // TODO: Have the category colours defined in the store, so UI can show a legend
      const colour = `rgb(${r}, ${g}, ${b})`;
      const { imageData, width, height } = createColouredMarker(image, colour);

      map.addImage(
        `category-${category}`,
        { width, height, data: imageData.data },
        { pixelRatio: 2 },
      );

      existingMarkers.push(category);
    });

    const layerExists = map.getLayer('markers') !== undefined;
    const source = map.getSource('markers') as mapboxgl.GeoJSONSource || undefined;
    const markerSourceData: any = {
      type: 'FeatureCollection',
      features: markers.map(({ lat, lng, category }, i) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            'marker-category': category,
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
          'icon-image': 'category-{marker-category}',
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