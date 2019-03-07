import { connect } from 'pwa-helpers';
import { LitElement, html } from 'lit-element';
import { store } from '../store';
import { removeSelectedCategory, addSelectedCategory } from '../store/actions';

class MapFilter extends connect(store)(LitElement) {

  private categories: any[];
  private visibleCategories: any[];

  static get properties() {
    return { 
      categories: { type: Array },
      visibleCategories: { type: Array },
    };
  }

  stateChanged(state: any) {
    this.categories = state.categories;
    this.visibleCategories = state.visibleCategories;
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
      <ul class="map-filter" @change="${this.inputChange}">
        ${this.categories.map((name) => {
          const isChecked = this.visibleCategories.includes(name);

          return html`
            <li class="map-filter__item">
              <label>
              <input 
                class="map-filter__item__input"
                type="checkbox"
                value="${name}"
                name="map-filter"
                .checked=${isChecked}
              />
              ${name}
              </label>
            </li>
          `;
        })}
      </ul>
    `;
  }

}

customElements.define('map-filter', MapFilter);