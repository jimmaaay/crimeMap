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

    if (!(typeof google === "object" && google.hasOwnProperty("maps"))) { // if no google script
      const script = document.createElement("SCRIPT");
      script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&callback=Map" + date;
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


  updateMap(obj) {

    if(obj !== null){

    const bounds = {
      north: obj.geometry.viewport.R.j,
      east: obj.geometry.viewport.j.R,
      south: obj.geometry.viewport.R.R,
      west: obj.geometry.viewport.j.j
    };

    const lat = obj.geometry.location.lat();
    const lng = obj.geometry.location.lng();

    const { north, east, south, west } = bounds;



    obj.bounds = bounds;

    if (this.previousSettings.lat !== lat && this.previousSettings.lng !== lng) {
      this.previousSettings.lat = lat;
      this.previousSettings.lng = lng;

      this.map.setOptions({
        center: {
          lat: obj.geometry.location.lat(),
          lng: obj.geometry.location.lng()
        },
        zoom: 12
      });
    }

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

    } else if(north !== this.previousSettings.bounds.north, east !== this.previousSettings.bounds.east, south !== this.previousSettings.bounds.south, west !== this.previousSettings.bounds.west) {
      this.previousSettings.bounds = {
        north,
        east,
        south,
        west
      }
      this.rectangle.setBounds(bounds);
    }

    this.emit("updated", obj);
  }
  else{
    alert("Try reselecting the place you wish to see data for.")
  }
  }

  addMarkers(obj) {
    const {
      key,
      data
    } = obj;

    if (key === "all") throw "can't use the key all";
    if (this.markers.hasOwnProperty(key)) throw "already a property with the key " + key;
    this.markers[key] = [];

    data.forEach(function(data) {
      const {
        lat,
        lng
      } = data;
      const marker = new google.maps.Marker({
        position: {
          lat,
          lng
        },
        map: this.map,
        //icon:"/images/location.svg",
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
