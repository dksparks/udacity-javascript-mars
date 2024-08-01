let store = {
  // Keep track of rover names in all lowercase for consistency
  // and capitalize via CSS
  curiosity: null,
  opportunity: null,
  spirit: null,

  // Order in which to display buttons for rovers (chronological)
  rovers: ["spirit", "opportunity", "curiosity"],

  // Other aspects of state
  selected: null,
  loading: false,
};

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};
const root = document.getElementById("root");
const render = async (root, state) => {
  root.innerHTML = App(state);
};
addEventListener("load", () => {
  render(root, store);
});

// Overall app content
const App = (state) => {
  return `${Header(state)}${DisplayRover(state)}`;
};

// Introductory message
const Intro = () => {
  return `
    <h1>Mars Rover Dashboard</h1>
    <p>
      Select a rover to view information and photos.
    </p>
  `;
};

// Higher-order function that returns a function
// to make a selected or unselected button
const ButtonComponent = (selected) => {
  const selectedAttr = selected ? "selected" : "";
  return (label) => {
    return `
      <button type="button"
          class="${selectedAttr}"
          onclick="selectRover(store, '${label}')">
        ${label}
      </button>
    `;
  };
};

// Menu with buttons to select rover
const Menu = (store) => {
  const rovers = store.rovers;
  const buttons = rovers.map((rover) => {
    return ButtonComponent(store.selected === rover)(rover);
  });
  return `<nav>${buttons.join("")}</nav>`;
};

// Click handler for buttons
const selectRover = async (store, rover) => {
  updateStore(store, { selected: rover, loading: true });
  // If rover data is already in store (and not null), do not get it again
  if (store[rover]) {
    updateStore(store, { loading: false });
  } else {
    const data = await getRover(rover);
    updateStore(store, { [rover]: data, loading: false });
  }
};

// Header component
const Header = (store) => `<header>${Intro()}${Menu(store)}</header>`;

// Rover display area component
const DisplayRover = (store) => {
  const { selected, loading } = store;
  if (!selected) return `<p>Select a rover above.</p>`;
  if (loading) return `<p>Loading data for ${store.selected}...</p>`;
  const data = store[store.selected];
  if (!data) return `<p>Data for ${store.selected} could not be loaded.</p>`;
  return JSON.stringify(data);
};

// API call to backend
const getRover = async (rover) => {
  const data = await fetch(`http://localhost:3000/rover/${rover}`)
    .then((fetchResponse) => fetchResponse.json());
  return data;
};
