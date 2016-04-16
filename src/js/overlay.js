import {
  EventEmitter
} from "events";
import {
  getData,
  lastUpdated
} from "./police-api.js";

export default class Overlay extends EventEmitter {
  constructor() {
    super();
    this.body = document.body;
    this.$overlay = document.getElementsByClassName("map-overlay")[0];
    this.$policeData = this.$overlay.getElementsByClassName("map-overlay__police-data")[0];
    this.$yearSelect = this.$overlay.getElementsByClassName("map-overlay__year-select")[0];
    this.$monthSelect = this.$overlay.getElementsByClassName("map-overlay__month-select")[0];
    this.$toggle = document.getElementsByClassName("map-overlay-toggle")[0];

    this.policeData = {
      showingData: false,
      requestStart: null,
      requestEnd: null,
      crimes: null
    };

    this.$toggle.addEventListener("click", this.toggleClick.bind(this));
    this.$overlay.addEventListener("click", this.overlayClick.bind(this));
    this.$overlay.addEventListener("change", this.overlayChange.bind(this));
    lastUpdated(function(err, res){

      if(!err){
        let date = res.date.split("-");
        let year = parseInt(date[0]);
        let month = parseInt(date[1]) - 1; // account for 0 based
        let fullDate = new Date(year, month);
        fullDate.setMonth(fullDate.getMonth() - 1);
        this.maxDate = {
          year:fullDate.getFullYear(),
          month:fullDate.getMonth()
        };
        this.$overlay.classList.add("map-overlay--loaded");
        this.generateDates();

      }

    }.bind(this));
  }

  generateDates(){

    let possibleDates = {};
    let currentDate = new Date(2012, 0);
    let keys;
    let year;
    let month;
    let $options;
    const endDate = new Date(this.maxDate.year, this.maxDate.month).getTime();

    while(currentDate.getTime() < endDate){
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // change to 1 based
      if(! possibleDates.hasOwnProperty(year)){
        possibleDates[year] = [];
      }
      possibleDates[year].push(month);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    keys = Object.keys(possibleDates);
    year = keys[keys.length -1];
    month = possibleDates[year];
    month = month[month.length - 1];


    this.$yearSelect.innerHTML = keys.map(function(key) {
      return `<option value="${key}">${key}</option>`;
    }).join("");

    $options = this.$yearSelect.getElementsByTagName("option");
    //console.log();
    this.$yearSelect.value = $options[$options.length - 1].value;
    this.possibleDates = possibleDates;
    this.setMonths(year, month);
    //console.log(month);

  }

  setMonths(year, monthToSelect){
    const months = this.possibleDates[year];

    this.$monthSelect.innerHTML = months.map(function(key) {
      return `<option value="${key}">${key}</option>`;
    }).join("");


    if(monthToSelect){
      let i = monthToSelect;
      if(! months[monthToSelect -1]){
        i = 1;
      }
      const $months = this.$monthSelect.getElementsByTagName("option");
      this.$monthSelect.value = i;
    }

  }

  createPoly(obj) {
    const {
      north,
      east,
      south,
      west
    } = obj;
    const poly = `${north},${east}:${south},${east}:${south},${west}:${north},${west}`;
    return poly;
  }

  policeDataCallback(err, res) {

    function changeData(str) {

      this.policeData.showingData = true;
      this.$policeData.innerHTML = str;
      setTimeout(() => { // allows opacity transition to work corretly
        this.$policeData.classList.add("map-overlay__police-data--show");
      }, 50);
    }

    if (err) {
      this.emit("error", err)
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


  locationChanged(mapData) {
    const poly = this.createPoly(mapData.bounds);
    this.policeData.requestStart = Date.now();

    if (this.policeData.showingData === true) {

      this.$policeData.style.transitionDelay = "0.3s";
      setTimeout(() => {
        this.$policeData.classList.remove("map-overlay__police-data--show");

        setTimeout(() => {
          this.$policeData.style.transitionDelay = null;
        }, 350);


      }, 50);


    }


    getData({
      poly,
      date: "2015-12",
      callback: this.policeDataCallback.bind(this)
    });

  }

  // event handlers
  //=====================================================================================
  overlayClick(e) {
    const {
      target
    } = e;

    if (target.classList.contains("map-overlay__police-data__section")) {
      let key = target.getAttribute("data-category");
      if (target.classList.contains("map-overlay__police-data__section--active")) { // remove markers
        target.classList.remove("map-overlay__police-data__section--active");
        this.emit("removeMarkers", key);
      } else { // add markers
        let crimes = this.policeData.crimes[key].map(function(obj) {
          return {
            lat: parseFloat(obj.location.latitude),
            lng: parseFloat(obj.location.longitude)
          };
        });
        target.classList.add("map-overlay__police-data__section--active");
        this.emit("addMarkers", {
          key,
          data: crimes
        });
      }

    }


  }

  overlayChange(e){
    const { target } = e;
    const isYear = target.classList.contains("map-overlay__year-select");
    const isMonth  = target.classList.contains("map-overlay__month-select");


    if(isYear){
      this.setMonths(target.value, this.$monthSelect.value);
    }

  }

  toggleClick(e){
    this.$overlay.classList.toggle("map-overlay--show");
    e.target.classList.toggle("map-overlay-toggle--open");
  }

  //=====================================================================================
}
