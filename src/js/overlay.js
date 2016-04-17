import {
  EventEmitter
} from "events";
import {
  getData,
  lastUpdated
} from "./police-api.js";

export default class Overlay extends EventEmitter {
  constructor(map) {

    super();
    this.map = map;
    this.mapData = {
      place: null,
      poly:null
    };
    this.el = {
      $place:null,
      $overlay: null,
      $submit: null,
      $year: null,
      $month: null,
      $policeData:null
    }
    this.eventFns = {
      click: [],
      change: []
    }
    this.possibleDates = null;
    this.loading = false;
    this.maxDate = null;
    this.policeData = {
      requestEnd:null,
      requestStart:null,
      crimes:null
    }
    lastUpdated(function(err, obj) {
      if (!err) {
        let date = obj.date.split("-").slice(0, 2);
        date = new Date(date[0], date[1] - 1);
        this.maxDate = date.getTime();
        this.init();
      }
    }.bind(this));

  }



  generateDates() {

    let possibleDates = {};
    let currentDate = new Date(2012, 0);
    let keys;
    let year;
    let month;
    let $options;
    const endDate = this.maxDate;

    while (currentDate.getTime() < endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // change to 1 based
      if (!possibleDates.hasOwnProperty(year)) {
        possibleDates[year] = [];
      }
      possibleDates[year].push(month);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    keys = Object.keys(possibleDates);
    year = keys[keys.length - 1];
    month = possibleDates[year];
    month = month[month.length - 1];


    this.el.$year.innerHTML = keys.map(function(key) {
      return `<option value="${key}">${key}</option>`;
    }).join("");

    $options = this.el.$year.getElementsByTagName("option");
    this.el.$year.value = $options[$options.length - 1].value;
    this.possibleDates = possibleDates;
    this.setMonths(year, month);
    this.currentDate = year + "-" + month;
  }

  setMonths(year, monthToSelect) {
    const months = this.possibleDates[year];

    this.el.$month.innerHTML = months.map(function(key) {
      return `<option value="${key}">${key}</option>`;
    }).join("");


    if (monthToSelect) {
      let i = monthToSelect;
      if (!months[monthToSelect - 1]) {
        i = 1;
      }
      const $months = this.el.$month.getElementsByTagName("option");
      this.el.$month.value = i;
    }

  }



  gotPlace(place) {
    this.mapData.place = place;
    this.mapData.poly = this.createPoly(place.geometry.viewport.R.j,place.geometry.viewport.j.R,place.geometry.viewport.R.R,place.geometry.viewport.j.j);
  }

  mapError() {
    console.log(arguments);
  }

  policeDataFn(err, res){
    function changeData(str) {

      this.el.$policeData.innerHTML = str;
      setTimeout(() => { // allows opacity transition to work corretly
        this.el.$policeData.classList.add("map-overlay__police-data--show");
      }, 50);
    }

    if (err) {
  //    this.emit("error", err)
    } else {
      let crimes = {};
      let str = "";
      let requestDiff;

      this.policeData.requestEnd = Date.now();

      res.forEach(function(data) {
        let category = data.category.replace(/-/g, " ")
          .split(" ").map(function(text) {
            return text.charAt(0).toUpperCase() + text.substr(1);
          }).join(" ");

        if (!crimes.hasOwnProperty(category)) {
          crimes[category] = [];
        }
        crimes[category].push(data);
      });


      for (let key in crimes) {
        str += `<div class='map-overlay__police-data__section' data-category="${key}">${crimes[key].length} x ${key}</div>`;
      }
      str += `<p>Total: ${res.length}</p>`

      requestDiff = this.policeData.requestEnd - this.policeData.requestStart;
      this.policeData.crimes = crimes;

      if (requestDiff < 1000) {
        setTimeout(() => {
          changeData.call(this, [str]);
        }, 1000 - requestDiff);
      } else {
        changeData.call(this, [str]);
      }

    }
  }

   createPoly(north, east, south, west) {
    const poly = `${north},${east}:${south},${east}:${south},${west}:${north},${west}`;
    return poly;
  }

  submitClick() {
    if (this.el.$place.value.trim() === "") {
      console.log("PLEASE SELECT A PLACE");
    } else {
      const formattedDate = this.el.$year.value + "-" + this.el.$month.value;
      this.map.updateMap(this.mapData.place);
      this.loading = true;
      this.policeData.requestStart = Date.now();
      getData({
        poly:this.mapData.poly,
        date:formattedDate,
        callback:this.policeDataFn.bind(this)
      });

    }
  }

  dataClick(target){
    let key = target.getAttribute("data-category");
    if (target.classList.contains("map-overlay__police-data__section--active")) { // remove markers
      target.classList.remove("map-overlay__police-data__section--active");
      this.map.removeMarkers(key);
    } else { // add markers
      let crimes = this.policeData.crimes[key].map(function(obj) {
        return {
          lat: parseFloat(obj.location.latitude),
          lng: parseFloat(obj.location.longitude)
        };
      });
      target.classList.add("map-overlay__police-data__section--active");
      this.map.addMarkers({
        key,
        data: crimes
      });
    }
  }

  yearChange() {
    const year = this.el.$year.value;
    const month = this.el.$month.value
    this.setMonths(year, month);
  }

  // one main eventHandler function
  eventHandler(root, e) {

    let {
      target
    } = e;
    const oTarget = target;
    const fns = this.eventFns[e.type];
    const _ = this;

    if (Array.isArray(fns)) {
      fns.forEach(function(obj) {
        let found = false;
        target = oTarget;

        while (!found && !target.isSameNode(root)) {

          if(typeof obj.el === "string"){

            if(target.classList.contains(obj.el)){
              found = true;
            }
            else{
              target = target.parentElement;
            }
          }
          else{
            if (target.isSameNode(obj.el)) {
              found = true;
            } else {
              target = target.parentElement;
            }
          }

        }


        if (found) {
          obj.fn.call(_, target);
        }
      });
    }


  }

  init() {
    this.el.$overlay = document.getElementsByClassName("map-overlay")[0];
    this.el.$submit = this.el.$overlay.getElementsByClassName("map-overlay__button")[0];
    this.el.$place = this.el.$overlay.getElementsByClassName("map-overlay__input")[0];
    this.el.$year = this.el.$overlay.getElementsByClassName("map-overlay__year-select")[0];
    this.el.$month = this.el.$overlay.getElementsByClassName("map-overlay__month-select")[0];
    this.el.$policeData = this.el.$overlay.getElementsByClassName("map-overlay__police-data")[0];

    this.generateDates();

    this.map
      .on("gotPlace", this.gotPlace.bind(this))
      .on("error", this.mapError.bind(this));

    // trying something new with event handlers - don't hate
    this.el.$overlay.addEventListener("click", this.eventHandler.bind(this, this.el.$overlay));
    this.el.$overlay.addEventListener("change", this.eventHandler.bind(this, this.el.$overlay));

    this.eventFns.change.push({
      el: this.el.$year,
      fn: this.yearChange
    });

    this.eventFns.click.push({
      el: this.el.$submit,
      fn: this.submitClick
    });

    this.eventFns.click.push({
      el:"map-overlay__police-data__section",
      fn:this.dataClick
    })

    this.el.$overlay.classList.add("map-overlay--show");
  }



}
