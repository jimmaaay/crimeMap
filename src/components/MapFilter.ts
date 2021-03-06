import { connect } from 'pwa-helpers';
import { LitElement, html, unsafeCSS } from 'lit-element';
import { store } from '../store';
import {
  removeSelectedCategory,
  addSelectedCategory,
} from '../store/actions';
import css from './MapFilter.string.scss';

class MapFilter extends connect(store)(LitElement) {

  private categoryNames: any[];
  private visibleCategories: any[];
  private categories: any;
  private loadingCrimeData: boolean;
  private showMapFilter: boolean;

  static get properties() {
    return { 
      categoryNames: { type: Array },
      visibleCategories: { type: Array },
      categories: { type: Object },
      loadingCrimeData: { type: Boolean },
      showMapFilter: { type: Boolean },
    };
  }

  static styles = unsafeCSS(css.toString());

  stateChanged(state: any) {
    this.categoryNames = state.categoryNames;
    this.visibleCategories = state.visibleCategories;
    this.categories = state.categories;
    this.loadingCrimeData = state.loadingCrimeData;
    this.showMapFilter = state.location != null && Object.keys(state.location).length !== 0;
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

  render() {
    const mapFilterClassNames = [
      'map-filter',
      !this.loadingCrimeData ? '' : 'map-filter--loading',
      !(this.showMapFilter && !this.loadingCrimeData)  ? '' : 'map-filter--show',
    ];
    return html`
      <div class="${mapFilterClassNames.join(' ')}">
        <div class="map-filter__loading"></div>
        <ul class="map-filter__items" @change="${this.inputChange}">
          ${this.categoryNames.map((name) => {
            const isChecked = this.visibleCategories.includes(name);
            const { markerColour, total } = this.categories[name];

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
                  ${total} X ${name}
                </label>
              </li>
            `;
          })}
        </ul>

        <p class="map-filter__total">Total ${this.categoryNames.reduce((count, name) => {
          const { total } = this.categories[name];
          return count + total;
        }, 0)}</p>
      </div>
    `;
  }

}

customElements.define('map-filter', MapFilter);