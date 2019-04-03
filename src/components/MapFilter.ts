import { connect } from 'pwa-helpers';
import { LitElement, html, css } from 'lit-element';
import { store } from '../store';
import { removeSelectedCategory, addSelectedCategory } from '../store/actions';

const MIN_YEAR = 2016;
class MapFilter extends connect(store)(LitElement) {

  private categoryNames: any[];
  private visibleCategories: any[];
  private categories: any;
  private policeAPILastUpdated: any;
  private selectedMonthYear: any;

  static get properties() {
    return { 
      categoryNames: { type: Array },
      visibleCategories: { type: Array },
      categories: { type: Object },
      policeAPILastUpdated: { type: Object },
      selectedMonthYear: { type: Object },
    };
  }

  static styles = css`
    .map-filter__items {
      margin: 0;
      padding: 0;
    }

    .map-filter__item {
      display: block;
    }

    .map-filter__item__label {
      display: block;
    }

    .map-filter__item__label::before {
      content: '';
      display: inline-block;
      width: 2rem;
      height: 2rem;
      background: var(--color);
      vertical-align: middle;
    }

    .map-filter__item__input:checked + .map-filter__item__fake-checkbox {
      background: red;
    }

    .map-filter__item__fake-checkbox {
      display: inline-block;
      width: 3rem;
      height: 3rem;
      border: 2px solid #fff;
      background: #fff;
    }
  `;

  stateChanged(state: any) {
    this.categoryNames = state.categoryNames;
    this.visibleCategories = state.visibleCategories;
    this.categories = state.categories;
    this.policeAPILastUpdated = state.policeAPILastUpdated;
    this.selectedMonthYear = state.selectedMonthYear;
  }

  inputChange(e: any) {
    const input = e.target.closest('.map-filter__item__input');
    if (input === null) return;
    const { value, checked } = input;
    const hasBeenAdded = checked;
    if (!hasBeenAdded) {
      store.dispatch(removeSelectedCategory((value)));
    } else {
      store.dispatch(addSelectedCategory(value));
    }

  }

  getMonthAndYearFilter() {
    if (this.policeAPILastUpdated === null) return html``;
    const { month, year } = this.policeAPILastUpdated;
    const { month: selectedMonth, year:selectedYear } = this.selectedMonthYear;
    const validYears = Array
      .from(new Array(year - MIN_YEAR + 1))
      .map((ignoreVar, i) => year - i);

    return html`
      <select>
        ${validYears.map((year) => {
          return html`
            <option .value="${year}" ?selected=${selectedYear === year}>
              ${year}
            </option>
          `;
        })}
      </select>
    `;
  }

  render() {
    const monthAndYearFilter = this.getMonthAndYearFilter();
    return html`
      <div class="map-filter">
        ${monthAndYearFilter}
        <ul class="map-filter__items" @change="${this.inputChange}">
          ${this.categoryNames.map((name) => {
            const isChecked = this.visibleCategories.includes(name);
            const { markerColour } = this.categories[name];

            return html`
              <li class="map-filter__item">
                <label class="map-filter__item__label" style="--color:${markerColour}">
                  <input 
                    class="map-filter__item__input"
                    type="checkbox"
                    value="${name}"
                    name="map-filter"
                    .checked=${isChecked}
                  />
                  <span class="map-filter__item__fake-checkbox"></span>
                  ${name}
                </label>
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }

}

customElements.define('map-filter', MapFilter);