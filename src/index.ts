import './styles/main.scss';
import mapInit from './map';
import './geocoding';

import './components/SearchForm';


const ui = document.querySelector('#ui');
const searchForm = ui.querySelector('search-form');

const { drawBox } = mapInit();

searchForm.addEventListener('searchForm:selected', (e: any) => {
  console.log(e.detail);
  const { bbox } = e.detail;
  drawBox(e.detail.id, [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[1]],
    [bbox[2], bbox[3]],
    [bbox[0], bbox[3]],
  ]);
});