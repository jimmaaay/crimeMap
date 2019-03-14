import './styles/main.scss';
import isEqual from 'lodash/isEqual';
import mapInit from './map';
import { store } from './store';
import { setCategories, getCrimes } from './store/actions';

import './components/SearchForm';
import './components/MapFilter';

const ui = document.querySelector('#ui');

const { drawBox, fitBounds, setMarkers } = mapInit();

const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj));

let previousLocation: any = null;

store.subscribe(() => {
  const { location } = store.getState();
  if (isEqual(location, previousLocation)) return;
  previousLocation = deepClone(location);

  const { bbox, id } = location;

  drawBox(id, [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[1]],
    [bbox[2], bbox[3]],
    [bbox[0], bbox[3]],

     // Have to explicitly give it the closing coords otherwise it can be buggy when drawing
    [bbox[0], bbox[1]],
  ]);
  fitBounds(bbox);

  store.dispatch(getCrimes(bbox));

  // getCrimesByBbox(bbox).then((data) => {
  //   const markerData = data.map(({ location }: any) => {
  //     return {
  //       lat: parseFloat(location.latitude),
  //       lng: parseFloat(location.longitude),
  //     };
  //   });

  //   const categories: any = [ ...new Set(data.map(({ category }: any) => category)) ];

  //   store.dispatch(setCategories(categories));
  //   setMarkers(markerData);
  // });
  
});
