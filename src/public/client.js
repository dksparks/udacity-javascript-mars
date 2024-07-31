let store = {
  // user: { name: "Student" },
  // apod: "",
  // rovers: ["Curiosity", "Opportunity", "Spirit"],
  curiosity: {},
  opportunity: {},
  spirit: {},
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  let { rovers, apod } = state;

  return `${Header(store)}`;
  // return `
  //       <header></header>
  //       <main>
  //           ${Greeting(store.user.name)}
  //           <section>
  //               <h3>Put things on the page!</h3>
  //               <p>Here is an example section.</p>
  //               <p>Here is another paragraph.</p>
  //               ${ImageOfTheDay(apod)}
  //           </section>
  //       </main>
  //       <footer></footer>
  //   `;
};

addEventListener("load", () => {
  selectRover(null);
  render(root, store);
});

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
const ButtonComponent = selected => {
  const selectedAttr = selected ? 'selected' : '';
  return label => {
    return `
      <button type="button"
          class="${selectedAttr}"
          onclick="selectRover('${label}')">
        ${label}
      </button>
    `;
  };
};

// Menu with buttons to select rover
const Menu = store => {
  const rovers = Object.keys(store);
  const { selected } = store;
  const buttons = rovers.map(rover => {
    return ButtonComponent(selected === rover)(rover);
  });
  return `<nav>${buttons.join('')}</nav>`;
};

// Click handler for buttons
const selectRover = rover => {
  console.log(`showing rover ${rover}`);
  render(root, store);
};

// Header component
const Header = store => {
  return `<header>${Intro()}${Menu(store)}</header>`;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(photodate.getDate(), today.getDate());

  console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `);
  } else {
    return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `);
  }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store, { apod }));

  return data;
};
