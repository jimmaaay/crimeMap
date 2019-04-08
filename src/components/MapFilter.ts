import { connect } from 'pwa-helpers';
import { LitElement, html, css } from 'lit-element';
import { store } from '../store';
import {
  removeSelectedCategory,
  addSelectedCategory,
    setSelectedFilterDate,
} from '../store/actions';

class MapFilter extends connect(store)(LitElement) {

  private categoryNames: any[];
  private visibleCategories: any[];
  private categories: any;

  static get properties() {
    return { 
      categoryNames: { type: Array },
      visibleCategories: { type: Array },
      categories: { type: Object },
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
    return html`
      <div class="map-filter">
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