import Map from "./map.js";
import Overlay from  "./overlay.js";

require('es6-promise').polyfill();




const $map = document.getElementsByClassName("map")[0];
const $input = document.getElementById("input");
const mapDefaults = {
  center: {
    lat: 52.3942358,
    lng: -2.2905
  },
  zoom: 7
};

const map = new Map({
  el:$map,
  defaults:mapDefaults,
  input:$input,
  countryCode:"GB"
});

const overlay = new Overlay(map);

$input.value = ""; // fixed bug with firefox

window.App = overlay;
