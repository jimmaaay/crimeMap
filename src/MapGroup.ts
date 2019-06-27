import { MapMarker } from './types';
import haversine from 'haversine';

class MapGroup {
  public markers: any[];
  public initialPosition: any;

  constructor(initialPosition: any) {
    this.markers = [];
    this.initialPosition = initialPosition;
  }

  addMarker(marker: MapMarker) {
    this.markers.push(marker);
  }

  shouldMarkerBeInGroup(marker: MapMarker, zoomLevel: number) {
    /**
     * max zoom level = 22
     * min zoom level = 0
     * 
     * At 0 group at 5m (or maybe don't group??)
     * At 22 group at 650km
     */
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

export default MapGroup;
