require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// API call for use by frontend
app.get("/rover/:rover", async (req, res) => {
  const rover = req.params.rover;
  const apiKey = `api_key=${process.env.API_KEY}`;
  const urlStem = "https://api.nasa.gov/mars-photos/api/v1";

  // Minimum number of photos to show
  const minNumberOfPhotosToShow = 6;

  // First get the manifest
  let manifest;
  try {
    manifest = await fetch(`${urlStem}/manifests/${rover}?${apiKey}`)
      .then((response) => response.json());
  } catch (err) {
    console.log("error:", err);
    res.send(null);
    return;
  }
  const { name, landing_date, launch_date, status, photos: photoInfo } =
    manifest.photo_manifest;

  // Determine which of the most recent sols
  // we need to look up to obtain at least
  // minNumberOfPhotosToShow
  const nPhotos = photoInfo.map((x) => x.total_photos);
  const nPhotosSince = nPhotos.map((_, i) =>
    nPhotos.slice(i).reduce((total, next) => total + next)
  );
  const startAt = nPhotosSince.findLastIndex((n) =>
    n >= minNumberOfPhotosToShow
  );
  const sols = photoInfo.slice(startAt).map((x) => x.sol);

  // Map each sol to an array of photo objects
  const photosBySol = await Promise.all(sols.map(async (sol) => {
    let photoData;
    try {
      const params = `${apiKey}&sol=${sol}`;
      photoData = await fetch(`${urlStem}/rovers/${rover}/photos?${params}`)
        .then((response) => response.json());
    } catch (err) {
      console.log("error:", err);
      return "error";
    }
    return photoData.photos;
  }));
  if (photosBySol.includes("error")) {
    res.send(null);
    return;
  }

  // Send response with info and photos
  res.send({
    name,
    launch_date,
    landing_date,
    status,
    photos: photosBySol.flat(),
  });
});

app.listen(port, () => console.log(`App listening on port ${port}`));
