let store = {
  // Keep track of rover names in all lowercase for consistency
  // and capitalize via CSS
  // curiosity: null,
  // opportunity: null,
  // spirit: null,

  // Order in which to display buttons for rovers (chronological)
  rovers: ["spirit", "opportunity", "curiosity"],

  // Other aspects of state
  selected: null,
  loading: false,
};

// Basic structural setup
const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};
const root = document.getElementById("root");
const render = (root, state) => {
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
    ${BrokenImageWarning()}
    <p>
      Select a rover below to view information and photos.
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
    try {
      const data = await getRover(rover);
      updateStore(store, { [rover]: data, loading: false });
    } catch (err) {
      console.log("error:", err);
      updateStore(store, { loading: false });
    }
  }
};

// Header component
const Header = (store) => `<header>${Intro()}${Menu(store)}</header>`;

// Rover display area component
const DisplayRover = (store) => {
  const { selected, loading } = store;
  if (!selected) return `<p>Select a rover above.</p>`;
  if (loading) {
    return `
      <p>Loading data for ${store.selected}...</p>
      <p>Note: This may take several seconds. The NASA API can be slow, and we
      may have to call it multiple times to collect enough photos to show.</p>
    `;
  }
  const data = store[store.selected];
  if (!data) return `<p>Data for ${store.selected} could not be loaded.</p>`;
  return `${roverInfo(data)}${roverPhotos(data)}`;
};

// Rover info component
const roverInfo = (data) => {
  const { name, launch_date, landing_date, status } = data;
  return `
    <h2>Rover: ${name}</h2>
    <ul>
      <li>Launch Date: ${launch_date}</li>
      <li>Landing Date: ${landing_date}</li>
      <li>Status: ${status}</li>
    </ul>
  `;
};

// Higher-order function that returns a function
// to make an html img element with a specified alt property
const PhotoWithAlt = (alt) => {
  return (src) => `<img src="${src}" alt="${alt}">`;
};

// Rover photo gallery component
const roverPhotos = (data) => {
  const { name, photos } = data;
  const img = PhotoWithAlt(`Photo from Mars Rover ${name}`);
  const figures = photos.map((photo) => {
    const { img_src, earth_date } = photo;
    return `
      <figure>${img(img_src)}<caption>${earth_date}</caption></figure>
    `;
  });
  return `<h3>Latest Photos</h3>${figures.join("")}`;
};

// Nasa broken image warning
const BrokenImageWarning = () => {
  return `
    <aside>
      <h3>Warning</h3>
      <p>
        The photos for the Spirit and Opportunity rovers
        <strong>are no longer available</strong> on NASA's website,
        i.e., the img_src urls provided in the NASA API response are
        <strong>broken</strong>.
      </p>
      <p>
        I have attempted to complete this project as if the images were
        still available, which means that they will appear as
        'broken image' icons, for which I have provided appropriate
        alternate text.
      </p>
      <p>
        The images for the Curiosity rover are still available
        on NASA's website and should appear as intended.
      </p>
    </aside>
  `;
};

// API call to backend
const getRover = async (rover) => {
  const data = await fetch(`http://localhost:3000/rover/${rover}`)
    .then((fetchResponse) => fetchResponse.json());
  return data;
};
