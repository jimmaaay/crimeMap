import * as mapboxgl from 'mapbox-gl';
import { LngLatBoundsLike } from 'mapbox-gl';
import haversine from 'haversine';
import markerUrl from './marker.png';
import { store } from './store';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;


interface MapMarker {
  lat: any;
  lng: any;
  category: string;
  persistendID: string;
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
    zoom: 6,
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

  (window as any).drawThingyBox = (left: number, top: number, right: number, bottom: number) => {
    // [bbox[0], bbox[1]],
    //   [bbox[2], bbox[1]],
    //   [bbox[2], bbox[3]],
    //   [bbox[0], bbox[3]],
  
    //    // Have to explicitly give it the closing coords otherwise it can be buggy when drawing
    //   [bbox[0], bbox[1]],

    const id = (Math.random() * 100000).toString();

    const coordinates = [
      [left, top],
      [right, top],
      [right, bottom],
      [left, bottom],
      [left, top],
    ];

    const sourceData: any = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  
      const bboxSource: any = {
        type: 'geojson',
        data: sourceData,
      };

      map.addSource(id, bboxSource);

      map.addLayer({
        id,
        type: 'fill',
        source: id,
        layout: {},
        paint: {
          'fill-color': '#'+Math.floor(Math.random()*16777215).toString(16),
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
    const { categories: categoriesObj } = store.getState();
    const categories = markers.map(({ category }) => category);
    const categoryMarkers = [ ...new Set(categories) ];

    const markerCategoriesToAdd = categoryMarkers
      .filter((category) => !existingMarkers.includes(category)); 

    markerCategoriesToAdd.forEach((category) => {
      const colour = categoriesObj[category].markerColour;
      const { imageData, width, height } = createColouredMarker(image, colour);

      map.addImage(
        `category-${category}`,
        { width, height, data: imageData.data },
        { pixelRatio: 2 },
      );

      existingMarkers.push(category);
    });


    let markersToShow: any[] = markers;

    const groupedIds = new Set();
    const groups: Group[] = [];

    class Group {
      public markers: any[];
      public initialPosition: any;

      constructor(initialPosition: any) {
        this.markers = [];
        this.initialPosition = initialPosition;
      }

      addMarker(marker: MapMarker) {
        this.markers.push(marker);
      }

      shouldMarkerBeInGroup(marker: MapMarker) {
        const milesDiff = haversine(
          {
            longitude: marker.lng,
            latitude: marker.lat,
          },
          {
            longitude: this.initialPosition.lng,
            latitude: this.initialPosition.lat,
          },
          { unit: 'mile' },
        );

        return milesDiff < 1;
      }
    }

    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i];
      let hasBeenAddedToGroup = false;

      for (let j = 0; j < groups.length; j++) {
        const group = groups[j];
        if (group.shouldMarkerBeInGroup(marker)) {
          group.addMarker(marker);
          hasBeenAddedToGroup = true;
          break;
        }
      }

      if (!hasBeenAddedToGroup) {
        const group = new Group({
          lat: marker.lat,
          lng: marker.lng,
        });

        groups.push(group);
      }

    }

    markersToShow = groups.map((group) => {
      console.log(`Group has ${group.markers.length} items`);
      return {
        lat: group.initialPosition.lat,
        lng: group.initialPosition.lng,
        category: 'burglary',
        persistendID: (Math.random() * 10000).toString(),
      };
    });


    const layerExists = map.getLayer('markers') !== undefined;
    const source = map.getSource('markers') as mapboxgl.GeoJSONSource || undefined;
    const markerSourceData: any = {
      type: 'FeatureCollection',
      features: markersToShow.map(({ lat, lng, category, persistendID }, i) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            persistendID,
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

  }

  // map
  //   .on('mouseenter', 'markers', () => {
  //     map.getCanvas().style.cursor = 'pointer';
  //   })
  //   .on('mouseleave', 'markers', () => {
  //     map.getCanvas().style.cursor = '';
  //   });


  return {
    drawBox,
    fitBounds,
    setMarkers,
  };

}