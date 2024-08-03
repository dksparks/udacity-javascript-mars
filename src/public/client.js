const store = {
  // Order in which to display buttons for rovers (chronological)
  rovers: ["spirit", "opportunity", "curiosity"],

  // Other aspects of state
  selected: null,
  loading: false,
};

// Basic structural setup
const updateStore = (state, newState) => {
  state = Object.assign(state, newState);
  render(root, state);
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
      Select a rover below to view its information and latest photos.
    </p>
  `;
};

// Higher-order function that returns a function
// to make a selected or unselected button
const ButtonComponent = (selected) => {
  const selectedAttr = selected ? " selected" : "";
  return (label) => {
    return `
      <button type="button"
          class="rover-name${selectedAttr}"
          onclick="selectRover(store, '${label}')">
        ${label}
      </button>
    `;
  };
};

// Menu with buttons to select rover
const Menu = (state) => {
  const rovers = state.rovers;
  const buttons = rovers.map((rover) => {
    return ButtonComponent(state.selected === rover)(rover);
  });
  return `<nav>${buttons.join("")}</nav>`;
};

// Click handler for buttons
const selectRover = async (state, rover) => {
  updateStore(state, { selected: rover, loading: true });
  // If rover data is already in store (and not null), do not get it again
  if (state[rover]) {
    updateStore(state, { loading: false });
  } else {
    try {
      const data = await getRover(rover);
      updateStore(state, { [rover]: data, loading: false });
    } catch (err) {
      console.log("error:", err);
      updateStore(state, { loading: false });
    }
  }
};

// Header component
const Header = (state) => `<header>${Intro()}${Menu(state)}</header>`;

// Rover display area component
const DisplayRover = (state) => {
  const { selected, loading } = state;
  if (!selected) return `<p>Select a rover above.</p>`;
  if (loading) {
    return `
      <p>
        Loading data for <span class="rover-name">${state.selected}</span>...
      </p>
      <p>
        Note: This may take several seconds. NASA's API can be slow, and we
        may have to call it multiple times to collect enough photos to show.
      </p>
    `;
  }
  const data = state[state.selected];
  if (!data) return `<p>Data for ${state.selected} could not be loaded.</p>`;
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
      <figure><figcaption>${earth_date}</figcaption>${img(img_src)}</figure>
    `;
  });
  return `<h3>Latest Photos</h3><div class="photos">${figures.join("")}</div>`;
};

// NASA broken image warning
const BrokenImageWarning = () => {
  return `
    <aside>
      <h3>Warning</h3>
      <p>
        The photos for Spirit and Opportunity are
        <strong>no longer available</strong> on NASA's website,
        i.e., the img_src urls in NASA's API response are
        <strong>broken</strong>.
      </p>
      <p>
        I have proceeded as if they were still available, which means
        they will appear as 'broken image' icons with alternate text.
      </p>
      <p>
        The images for Curiosity are still available
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
