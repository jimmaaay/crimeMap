import './styles/main.scss';
import mapInit from './map';
import { getCrimesByBbox } from './policeAPI';

import './components/SearchForm';


const ui = document.querySelector('#ui');
const searchForm = ui.querySelector('search-form');

const { drawBox, fitBounds, addMarkers } = mapInit();

searchForm.addEventListener('searchForm:selected', (e: any) => {
  const { bbox } = e.detail;
  drawBox(e.detail.id, [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[1]],
    [bbox[2], bbox[3]],
    [bbox[0], bbox[3]],

     // Have to explicitly give it the closing coords otherwise it can be buggy when drawing
    [bbox[0], bbox[1]],
  ]);
  fitBounds(bbox);

  getCrimesByBbox(bbox).then((data) => {
    const markerData = data.map(({ location }: any) => {
      return {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      };
    });

    addMarkers(markerData);
  });
});