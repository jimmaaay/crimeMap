import './styles/main.scss';
import mapInit from './map';
import { store } from './store';
import { watch } from './store/watch';

import './components/SearchForm';
import './components/MapFilter';

(async () => {
  const { drawBox, fitBounds, setMarkers } = await mapInit();

  watch(store, 'location', (location: any) => {
    const { bbox } = location;
    drawBox([
      [bbox[0], bbox[1]],
      [bbox[2], bbox[1]],
      [bbox[2], bbox[3]],
      [bbox[0], bbox[3]],
  
       // Have to explicitly give it the closing coords otherwise it can be buggy when drawing
      [bbox[0], bbox[1]],
    ]);
    fitBounds(bbox);
  });
  
  
  /**
   * Only need to watch visibleCategories as these will be set when new crimes
   * are added to the store.
   */
  watch(store, 'visibleCategories', (categories: string[]) => {
    const { crimes } = store.getState();
    const markerData = crimes
      .filter(({ category }: any) => categories.includes(category))
      .map(({ location, category }: any) => {
        return {
          category,
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude),
        };
      });
    setMarkers(markerData);
  });
  
})();
