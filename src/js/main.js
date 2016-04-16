import Map from "./map.js";
import * as fetchPolyfill from "whatwg-fetch";
import Overlay from "./overlay.js";

const $map = document.getElementsByClassName("map")[0];
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
  input:document.getElementById("input"),
  countryCode:"GB"
});

const overlay = new Overlay();


map.on("updated", overlay.locationChanged.bind(overlay));
map.on("error", function() {
  console.log(arguments);
})
overlay.on("addMarkers", map.addMarkers.bind(map));
overlay.on("removeMarkers", map.removeMarkers.bind(map));
