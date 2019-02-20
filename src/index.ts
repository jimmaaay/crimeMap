import { render } from 'lit-html';
import searchBoxTemplate from './templates/searchBox';
import './styles/main.scss';
import './map';
import './geocoding';


const ui = document.querySelector('#ui');

render(searchBoxTemplate(), ui);