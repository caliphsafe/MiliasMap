mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const locations = [
  {
    id: "maria-julia",
    title: "Maria Julia",
    place: "Santiago Island, Cape Verde",
    country: "Cape Verde",
    coords: [-23.60, 15.10],
    description: "Unlocked in Santiago Island, Cape Verde.",
    audio: "audio/maria-julia.mp3",
    art: "images/maria-julia.jpg"
  },
  {
    id: "pilon-pilon",
    title: "Pilon Pilon",
    place: "São Nicolau, Cape Verde",
    country: "Cape Verde",
    coords: [-24.33, 16.60],
    description: "Unlocked on São Nicolau, Cape Verde.",
    audio: "audio/pilon-pilon.mp3",
    art: "images/pilon-pilon.jpg"
  },
  {
    id: "polygamy",
    title: "Polygamy",
    place: "Abidjan, Ivory Coast",
    country: "Ivory Coast",
    coords: [-4.0083, 5.3599],
    description: "Unlocked in Abidjan, Ivory Coast.",
    audio: "audio/polygamy.mp3",
    art: "images/polygamy.jpg"
  },
  {
    id: "minina",
    title: "Minina",
    place: "Praia, Santiago, Cape Verde",
    country: "Cape Verde",
    coords: [-23.5133, 14.9330],
    description: "Unlocked in Praia, Cape Verde.",
    audio: "audio/minina.mp3",
    art: "images/minina.jpg"
  },
  {
    id: "leave",
    title: "Leave",
    place: "Brava, Cape Verde",
    country: "Cape Verde",
    coords: [-24.72, 14.87],
    description: "Unlocked on Brava, Cape Verde.",
    audio: "audio/leave.mp3",
    art: "images/leave.jpg"
  },
  {
    id: "allons-y",
    title: "Allons-Y",
    place: "Fogo, Cape Verde",
    country: "Cape Verde",
    coords: [-24.35, 14.95],
    description: "Unlocked on Fogo, Cape Verde.",
    audio: "audio/allons-y.mp3",
    art: "images/allons-y.jpg"
  },
  {
    id: "not-today",
    title: "Not Today",
    place: "Abuja, Nigeria",
    country: "Nigeria",
    coords: [7.3986, 9.0765],
    description: "Unlocked in Abuja, Nigeria.",
    audio: "audio/not-today.mp3",
    art: "images/not-today.jpg"
  },
  {
    id: "outside",
    title: "Outside",
    place: "Dakar, Senegal",
    country: "Senegal",
    coords: [-17.4677, 14.7167],
    description: "Unlocked in Dakar, Senegal.",
    audio: "audio/outside.mp3",
    art: "images/outside.jpg"
  },
  {
    id: "plenty-love",
    title: "Plenty Love",
    place: "Conakry, Guinea",
    country: "Guinea",
    coords: [-13.6773, 9.6412],
    description: "Unlocked in Conakry, Guinea.",
    audio: "audio/plenty-love.mp3",
    art: "images/plenty-love.jpg"
  }
];

const WEST_AFRICA_BOUNDS = [
  [-26.5, 3.5],  // southwest
  [9.5, 18.8]    // northeast
];

const mapStyles = [
  "mapbox://styles/mapbox/navigation-night-v1",
  "mapbox://styles/mapbox/dark-v11"
];

let currentStyleIndex = 0;
let currentSong = null;
let map;
let geojson;

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const locateBtn = document.getElementById("locateBtn");
const styleToggle = document.getElementById("styleToggle");

const miniPlayer = document.getElementById("miniPlayer");
const miniTitle = document.getElementById("miniTitle");
const miniLocation = document.getElementById("miniLocation");
const openSheetBtn = document.getElementById("openSheetBtn");

const songSheet = document.getElementById("songSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const closeSheetBtn = document.getElementById("closeSheetBtn");
const playSongBtn = document.getElementById("playSongBtn");

const sheetTitle = document.getElementById("sheetTitle");
const sheetPlace = document.getElementById("sheetPlace");
const sheetDescription = document.getElementById("sheetDescription");
const sheetArt = document.getElementById("sheetArt");
const audioPlayer = document.getElementById("audioPlayer");

function buildGeoJSON() {
  return {
    type: "FeatureCollection",
    features: locations.map((loc) => ({
      type: "Feature",
      properties: {
        id: loc.id,
        title: loc.title,
        place: loc.place,
        description: loc.description
      },
      geometry: {
        type: "Point",
        coordinates: loc.coords
      }
    }))
  };
}

function initMap() {
  geojson = buildGeoJSON();

  map = new mapboxgl.Map({
    container: "map",
    style: mapStyles[currentStyleIndex],
    center: [-10.5, 11.5],
    zoom: 3.9,
    pitch: 0,
    bearing: 0,
    projection: "mercator",
    attributionControl: false,
    maxBounds: WEST_AFRICA_BOUNDS
  });

  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: false }),
    "top-left"
  );

  map.on("load", () => {
    addSourcesAndLayers();

    map.fitBounds(WEST_AFRICA_BOUNDS, {
      padding: {
        top: 100,
        right: 50,
        bottom: 210,
        left: 50
      },
      duration: 0
    });
  });
}

function addSourcesAndLayers() {
  if (map.getSource("songs")) return;

  map.addSource("songs", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 6,
    clusterRadius: 50
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "songs",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#d7c5b3",
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        3, 24,
        6, 28
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255,255,255,0.88)"
    }
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "songs",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count"],
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 14
    },
    paint: {
      "text-color": "#0d1d31"
    }
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "songs",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#9ed6ff",
      "circle-radius": 8,
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff"
    }
  });

  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    if (!features.length) return;

    const clusterId = features[0].properties.cluster_id;

    map.getSource("songs").getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom
      });
    });
  });

  map.on("click", "unclustered-point", (e) => {
    const feature = e.features[0];
    if (!feature) return;

    const id = feature.properties.id;
    const song = locations.find((loc) => loc.id === id);

    if (song) openSong(song);
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("mouseenter", "unclustered-point", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "unclustered-point", () => {
    map.getCanvas().style.cursor = "";
  });
}

function openSong(song) {
  currentSong = song;

  miniTitle.textContent = song.title;
  miniLocation.textContent = song.place;
  miniPlayer.classList.remove("hidden");

  sheetTitle.textContent = song.title;
  sheetPlace.textContent = song.place;
  sheetDescription.textContent = song.description;
  sheetArt.src = song.art;
  sheetArt.alt = `${song.title} artwork`;
  audioPlayer.src = song.audio || "";

  map.easeTo({
    center: song.coords,
    zoom: 6.6,
    duration: 1200
  });

  showSheet();
}

function showSheet() {
  songSheet.classList.remove("hidden");
  sheetBackdrop.classList.remove("hidden");

  requestAnimationFrame(() => {
    songSheet.classList.add("open");
  });
}

function hideSheet() {
  songSheet.classList.remove("open");

  setTimeout(() => {
    songSheet.classList.add("hidden");
    sheetBackdrop.classList.add("hidden");
  }, 300);
}

function searchPlaces() {
  const value = searchInput.value.trim().toLowerCase();
  if (!value) return;

  const found = locations.find((loc) =>
    `${loc.title} ${loc.place} ${loc.country}`.toLowerCase().includes(value)
  );

  if (found) {
    openSong(found);
    return;
  }

  map.fitBounds(WEST_AFRICA_BOUNDS, {
    padding: {
      top: 100,
      right: 50,
      bottom: 210,
      left: 50
    },
    duration: 900
  });
}

function clearSearchField() {
  searchInput.value = "";

  map.fitBounds(WEST_AFRICA_BOUNDS, {
    padding: {
      top: 100,
      right: 50,
      bottom: 210,
      left: 50
    },
    duration: 900
  });
}

function locateUser() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;

      map.easeTo({
        center: [lng, lat],
        zoom: 10,
        duration: 1200
      });

      new mapboxgl.Marker({ color: "#ffffff" })
        .setLngLat([lng, lat])
        .addTo(map);
    },
    () => {
      console.log("Location access denied or unavailable.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
}

function rebuildMapStyle() {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const bearing = map.getBearing();
  const pitch = map.getPitch();

  map.setStyle(mapStyles[currentStyleIndex]);

  map.once("style.load", () => {
    addSourcesAndLayers();

    map.jumpTo({
      center,
      zoom,
      bearing,
      pitch
    });
  });
}

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchPlaces();
  }
});

clearSearch.addEventListener("click", clearSearchField);
locateBtn.addEventListener("click", locateUser);

styleToggle.addEventListener("click", () => {
  currentStyleIndex = (currentStyleIndex + 1) % mapStyles.length;
  rebuildMapStyle();
});

openSheetBtn.addEventListener("click", showSheet);
closeSheetBtn.addEventListener("click", hideSheet);
sheetBackdrop.addEventListener("click", hideSheet);

playSongBtn.addEventListener("click", () => {
  if (!currentSong) return;
  audioPlayer.play();
});

initMap();