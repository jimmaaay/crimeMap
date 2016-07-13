import {
  EventEmitter
} from "events";

import Assign from "object.assign/polyfill";
import alert from "./popup.js";

const assign = Assign();

export default class Map extends EventEmitter {
  constructor() {
    super();
    const date = Date.now();
    this.body = document.body;
    this.settings = arguments[0];
    this.markers = {}; // stores markers
    this.previousSettings = {
      bounds: {
        north: null,
        east: null,
        south: null,
        west: null
      },
      lat: null,
      lng: null
    };

    // used for working out zoom level
    let zoomLevelData = {};
    const tileSize = 256;
    const initialLatToPx = 256 / 180;
    const initialLngToPx = 256 / 360;
    let fakeTileSize = tileSize;
    let zoom = 0;

    while (zoom < 20) {

      zoomLevelData[zoom] = {
        latToPx: initialLatToPx * (fakeTileSize / tileSize),
        lngToPx: initialLngToPx * (fakeTileSize / tileSize)
      }
      fakeTileSize = fakeTileSize * 2;
      zoom++;
    }

    this.zoomLevelData = zoomLevelData;


    if (!(typeof google === "object" && google.hasOwnProperty("maps"))) { // if no google script
      const script = document.createElement("SCRIPT");
      if(window.debug === true){
        script.src = "https://maps.googleapis.com/maps/api/js?v=3&libraries=places&callback=Map" + date;
      }
      else{
      script.src = "https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyA21Xad94gjpC7J0BIdJgBhE0awlNSJuB4&libraries=places&callback=Map" + date;
      }
      script.defer = true;
      script.async = true;
      this.body.appendChild(script);

      window["Map" + date] = this.initMap.bind(this);
    } else {
      this.initMap();
    }
  }

  initMap() {
    let settings = assign(this.settings.defaults, {
      streetViewControl: false,
    });
    //this.settings.defaults.streetViewControl = false;

    this.map = new google.maps.Map(this.settings.el, settings);
    this.geocoder = new google.maps.Geocoder();
    this.autocomplete = new google.maps.places.Autocomplete(this.settings.input, {
      types: ["(cities)"],
      componentRestrictions: {
        country: this.settings.countryCode
      }
    });

    this.autocomplete.addListener("place_changed", this.placeChanged.bind(this));
    this.emit("loaded");
  }


  placeChanged() {
    const place = this.autocomplete.getPlace();

    if (place.hasOwnProperty("geometry")) {
      //this.updateMap(place);
      this.emit("gotPlace", place);
    } else {
      this.emit("error", {
        code: 1,
        msg: "No geometry property on place object",
        data: place
      });
    }
  }

  getZoom(obj) {
    // lat north to south
    //long east to west
    const { north, east, south, west } = obj
    const zoomLevelData = this.zoomLevelData;
    const lngDiff = east - west;
    const latDiff = north - south;

    function getMaxZoom(key, diff, maxValue) {
      let loop = true;
      let maxZoom = 0;

      while(loop){
        const zoom = maxZoom + 1;
        const width = diff * zoomLevelData[zoom][key];

        if(width < maxValue){
          maxZoom = zoom;
        }
        else{
          loop = false;
        }
      }

      return maxZoom;
    }

    const maxLngZoom = getMaxZoom("lngToPx", lngDiff, window.innerWidth);
    const maxLatZoom = getMaxZoom("latToPx", latDiff, window.innerHeight);

    return Math.min(maxLngZoom, maxLatZoom);
  }

  updateMap(obj) {

    if (obj !== null) {

      const bounds = obj.geometry.viewport.toJSON();
      const lat = obj.geometry.location.lat();
      const lng = obj.geometry.location.lng();

      const {
        north,
        east,
        south,
        west
      } = bounds;



      obj.bounds = bounds;

        this.map.setOptions({
          center: obj.geometry.viewport.getCenter().toJSON(),
          zoom: this.getZoom(bounds)
        });

      if (!this.hasOwnProperty("rectangle")) {
        this.rectangle = new google.maps.Rectangle({
          bounds,
          map: this.map,
          fillColor: "#000000",
          fillOpacity: 0,
          strokeColor: "#e64c4c",
          strokeOpacity: 0.8,
          strokeWeight: 2
        });

        this.previousSettings.bounds = {
          north,
          east,
          south,
          west
        }

      } else if (north !== this.previousSettings.bounds.north, east !== this.previousSettings.bounds.east, south !== this.previousSettings.bounds.south, west !== this.previousSettings.bounds.west) {
        this.previousSettings.bounds = {
          north,
          east,
          south,
          west
        }
        this.rectangle.setBounds(bounds);
      }

      this.emit("updated", obj);
    } else {
      alert("Try reselecting the place you wish to see data for.")
    }
  }

  addMarkers({key, data, colour:markerColour}) {
    // const {
    //   key,
    //   data
    // } = obj;

    if (key === "all") throw "can't use the key all";
    if (this.markers.hasOwnProperty(key)) throw "already a property with the key " + key;
    let prevCoords = [];
    this.markers[key] = [];

    data.forEach(function(data) {

      let {
        lat,
        lng
      } = data;

      let coords = lat + "-" + lng;

      if(prevCoords.indexOf(coords !== -1)){
        lat = lat +(Math.random() * 0.0001);
        lng = lng +(Math.random() * 0.0001);
        coords = lat + "-" + lng;
      }



      prevCoords.push(coords);

      //const markerColour = "#333333";

        //console.log(lat, lng);
      const marker = new google.maps.Marker({
        position: {
          lat,
          lng
        },
        map: this.map,
        //icon:"/images/location.svg",
        icon:`data:image/svg+xml;utf8,<svg id="Capa_1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 21.1 33"><style>.st0{fill:${markerColour};stroke:#000000;stroke-miterlimit:10;}</style><path class="st0" d="M10.6.5C5 .5.5 5 .5 10.5c0 3.6 1.6 8.4 4.9 14.2 2.4 4.3 4.9 7.6 4.9 7.6.1.1.2.1.3.1.1 0 .2-.1.3-.2 0 0 2.5-3.7 4.8-8.2 3.2-6.1 4.9-10.6 4.9-13.6 0-5.4-4.5-9.9-10-9.9zm4.6 10.3c0 2.6-2.1 4.6-4.6 4.6C8 15.4 6 13.3 6 10.8s2-4.7 4.5-4.7c2.6 0 4.7 2.1 4.7 4.7z"/></svg>`
        //animation:google.maps.Animation.DROP

      });

      this.markers[key].push(marker);

    }.bind(this));
  }

  removeMarkers(key) {

    function clearMarkers(arr) {
      arr.forEach(function(marker) {
        marker.setMap(null);
      });
    }

    if (key === "all") {
      for (let key in this.markers) {
        clearMarkers(this.markers[key]);
      }
      this.markers = [];
    } else {
      clearMarkers(this.markers[key]);
      //this.markers[key] = [];
      delete this.markers[key];
    }

  }

};
