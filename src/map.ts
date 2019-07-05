import * as mapboxgl from 'mapbox-gl';
import { LngLatBoundsLike } from 'mapbox-gl';
import v4 from 'uuid';
import haversine from 'haversine';
import markerUrl from './marker.png';
import { store } from './store';
import { MapMarker } from './types';

(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;

interface GroupArgs {
  initialPosition: any;
  map: mapboxgl.Map;
}

const CLUSTER_RADIUS = 40;

class Group {
  public markers: any[];
  public initialPosition: any;
  public bounds: mapboxgl.LngLatBounds;
  private map: mapboxgl.Map;
  public id: string;

  public markerMaxBounds: any;

  constructor(options: GroupArgs) {
    const { initialPosition, map } = options;
    this.markers = [];
    this.initialPosition = initialPosition;
    this.map = map;
    this.id = v4();
    this.markerMaxBounds = {
      east: this.initialPosition.lng,
      west: this.initialPosition.lng,
      north: this.initialPosition.lat,
      south: this.initialPosition.lat,
    };

    this.getBounds();
  }

  addMarker(marker: MapMarker) {
    this.markers.push(marker);

    if (this.markerMaxBounds.east < marker.lng) {
      this.markerMaxBounds.east = marker.lng;
    }

    if (this.markerMaxBounds.west > marker.lng) {
      this.markerMaxBounds.west = marker.lng;
    }

    if (this.markerMaxBounds.north < marker.lat) {
      this.markerMaxBounds.north = marker.lat;
    }

    if (this.markerMaxBounds.south > marker.lat) {
      this.markerMaxBounds.south = marker.lat;
    }
  }

  getMarkerBounds() {
    return new mapboxgl.LngLatBounds(
      [this.markerMaxBounds.west, this.markerMaxBounds.south],
      [this.markerMaxBounds.east, this.markerMaxBounds.north],
    );
  }

  getBounds() {
    // Convert latLng to pixels
    const point = this.map.project({
      lat: this.initialPosition.lat,
      lon: this.initialPosition.lng,
    });

    const radius = CLUSTER_RADIUS * 2 * 1.25;
    
    const northEastPoint = {
      x: point.x + radius,
      y: point.y - radius,
    } as mapboxgl.PointLike;

    const southWestPoint = {
      x: point.x - radius,
      y: point.y + radius,
    } as mapboxgl.PointLike;

    const bounds = new mapboxgl.LngLatBounds(
      this.map.unproject(southWestPoint), // convert back to latLng
      this.map.unproject(northEastPoint), // convert back to latLng
    );

    this.bounds = bounds;
  }

  shouldMarkerBeInGroup(marker: MapMarker) {
    const north = this.bounds.getNorth();
    const east = this.bounds.getEast();
    const south = this.bounds.getSouth();
    const west = this.bounds.getWest();

    return (
      marker.lng <= east
      && marker.lng >= west
      && marker.lat >= south
      && marker.lat <= north
    );
  }
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

  const canvas = document.createElement('canvas');
  canvas.width = CLUSTER_RADIUS * 2
  canvas.height = CLUSTER_RADIUS * 2;

  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(CLUSTER_RADIUS, CLUSTER_RADIUS, CLUSTER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = 'rgb(255, 0, 0)';
  ctx.fill();
  ctx.closePath();

  const redCircleImageData = ctx.getImageData(0, 0, CLUSTER_RADIUS * 2, CLUSTER_RADIUS * 2);

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 6,
    center: [ // mapbox puts lng then lat
      -4.259816,
      54.620976,
    ],
  });

  map.addImage(
    `cluster-red`,
    { width: CLUSTER_RADIUS * 2, height: CLUSTER_RADIUS * 2, data: redCircleImageData.data },
    // { pixelRatio: 2 },
  );

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


  // let drawGroupsCalled = fals

  const drawGroups = (groups: Group[]) => {
    const source = map.getSource('markers') as mapboxgl.GeoJSONSource || undefined;
    const markerSourceData: any = {
      type: 'FeatureCollection',
      features: groups.map((group, i) => {
        const { lng, lat } = group.initialPosition;
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: group.id,
            'marker-image': 'red',
            title: group.markers.length.toString(),
          },
        };
        // { lat, lng, category, persistendID }
        // return {
        //   type: 'Feature',
        //   geometry: {
        //     type: 'Point',
        //     coordinates: [lng, lat]
        //   },
        //   properties: {
        //     persistendID,
        //     'marker-category': category,
        //   },
        // };
      }),
    };

    source.setData(markerSourceData);
  
  };



  let currentMarkers: MapMarker[] = [];
  let currentGroups: Group[] = [];
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
    currentMarkers = markers;

    const groups = getMarkerGroups(markers);
    currentGroups = groups;
    markersToShow = groups;

    const layerExists = map.getLayer('markers') !== undefined;
    const source = map.getSource('markers') as mapboxgl.GeoJSONSource || undefined;
    const markerSourceData: any = {
      type: 'FeatureCollection',
      features: [],
    };

    if (source === undefined) {
      const markerSource: any = {
        type: 'geojson',
        data: markerSourceData,
      };
      map.addSource('markers', markerSource);
    }

    drawGroups(groups);

    if (!layerExists) {
      map.addLayer({
        id: 'markers',
        type: 'symbol',
        source: 'markers',
        layout: {
          'icon-image': 'cluster-{marker-image}',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'text-field': '{title}',
          // "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          // "text-offset": [0, 0.6],
          // "text-anchor": "top"
        },
      });
    }

  }

  const getMarkerGroups = (markers: MapMarker[]): Group[] => {
    const bounds = map.getBounds();
    

  
    const groups: Group[] = [];

    // console.log(bounds, window.innerWidth);


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
          map,
          initialPosition: {
            lat: marker.lat,
            lng: marker.lng,
          },
        });

        group.addMarker(marker);
        groups.push(group);
      }

    }

    return groups;
  }


  let prevZoom = 0;

  map.on('zoom', () => {
    const zoom = Math.floor(map.getZoom());
    if (prevZoom === zoom) return;
    prevZoom = zoom;
    if (currentMarkers.length === 0) return;

    const groups = getMarkerGroups(currentMarkers);
    currentGroups = groups;
    drawGroups(groups);
  });

  map.on('click', 'markers', (e) => {
    const clickedItem = e.features[0];
    const { id: groupId } = clickedItem.properties;
    const group = currentGroups.find(group => groupId === group.id);
    if (group === undefined) throw new Error(`Cannot find group ${groupId}`);
    map.fitBounds(group.getMarkerBounds(), {
      padding: 50,
    });
  });


  return {
    drawBox,
    fitBounds,
    setMarkers,
  };

}