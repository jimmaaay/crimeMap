import { LitElement, html } from 'lit-element';

class MapFilter extends LitElement {

  private categories: any[];
  private visibleCategories: any[];

  static get properties() {
    return { 
      categories: { type: Array },
      visibleCategories: { type: Array },
    };
  }

  constructor() {
    super();

    this.categories = [];
    this.visibleCategories = [];
  }

  setCategories(categories: any[]) {
    this.categories = categories;
  }

  inputChange(e: any) {
    const input = e.target.closest('.map-filter__item__input');
    if (input === null) return;
    console.log(e);
  }

  render() {
    return html`
      <ul class="map-filter" @change="${this.inputChange}">
        ${this.categories.map((name) => {
          const isChecked = this.visibleCategories.includes(name);

          return html`
            <li class="map-filter__item">
              <input 
                class="map-filter__item__input"
                type="checkbox"
                value="${name}"
                name="map-filter"
                .checked=${isChecked}
              />
              ${name}
            </li>
          `;
        })}
      </ul>
    `;
  }

}

customElements.define('map-filter', MapFilter);