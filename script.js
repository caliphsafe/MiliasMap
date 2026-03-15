// Replace with your token
mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const locations = [
  {
    id: "fogo",
    title: "Volcano Echoes",
    place: "Pico do Fogo, Cape Verde",
    country: "Cape Verde",
    coords: [-24.35, 14.95],
    description: "A cinematic track unlocked at the volcanic heights of Fogo.",
    audio: "audio/volcano-echoes.mp3",
    art: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "praia",
    title: "Atlantic Memory",
    place: "Praia, Santiago, Cape Verde",
    country: "Cape Verde",
    coords: [-23.51, 14.92],
    description: "A late-night ocean memory piece tied to the capital shoreline.",
    audio: "audio/atlantic-memory.mp3",
    art: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "mindelo",
    title: "Harbor Light",
    place: "Mindelo, São Vicente, Cape Verde",
    country: "Cape Verde",
    coords: [-24.98, 16.88],
    description: "A warm, drifting song built around port-city energy and nostalgia.",
    audio: "audio/harbor-light.mp3",
    art: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "abidjan",
    title: "Lagoon Frequency",
    place: "Abidjan, Ivory Coast",
    country: "Ivory Coast",
    coords: [-4.03, 5.36],
    description: "A sleek and rhythmic city record tied to the pulse of Abidjan.",
    audio: "audio/lagoon-frequency.mp3",
    art: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "yamoussoukro",
    title: "Stone & Sky",
    place: "Yamoussoukro, Ivory Coast",
    country: "Ivory Coast",
    coords: [-5.28, 6.82],
    description: "A reflective song unlocked inland, wide and spiritual in feeling.",
    audio: "audio/stone-and-sky.mp3",
    art: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "grandbassam",
    title: "Palm Signal",
    place: "Grand-Bassam, Ivory Coast",
    country: "Ivory Coast",
    coords: [-3.74, 5.20],
    description: "A soft coastal groove tied to movement, memory, and heat.",
    audio: "audio/palm-signal.mp3",
    art: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
  }
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
    center: [-15.5, 10.2],
    zoom: 3.15,
    pitch: 0,
    bearing: 0,
    attributionControl: false
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");

  map.on("load", () => {
    addSourcesAndLayers();
  });
}

function addSourcesAndLayers() {
  if (map.getSource("songs")) return;

  map.addSource("songs", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 7,
    clusterRadius: 55
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "songs",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#cdbeb0",
      "circle-radius": [
        "step",
        ["get", "point_count"],
        22,
        3, 26,
        6, 30
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255,255,255,0.85)"
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
      "text-color": "#122033"
    }
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "songs",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#95d3ff",
      "circle-radius": 8,
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff"
    }
  });

  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
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
    const id = feature.properties.id;
    const match = locations.find((loc) => loc.id === id);
    if (match) {
      openSong(match);
    }
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
  audioPlayer.src = song.audio;

  map.easeTo({
    center: song.coords,
    zoom: 8,
    duration: 1400
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
  }
}

function clearSearchField() {
  searchInput.value = "";
  searchInput.focus();
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
        duration: 1400
      });

      new mapboxgl.Marker({ color: "#ffffff" })
        .setLngLat([lng, lat])
        .addTo(map);
    },
    () => {
      alert("Location access was denied or unavailable.");
    },
    { enableHighAccuracy: true }
  );
}

function rebuildMapStyle() {
  const currentCenter = map.getCenter();
  const currentZoom = map.getZoom();
  const currentBearing = map.getBearing();
  const currentPitch = map.getPitch();

  map.setStyle(mapStyles[currentStyleIndex]);

  map.once("style.load", () => {
    addSourcesAndLayers();
    map.jumpTo({
      center: currentCenter,
      zoom: currentZoom,
      bearing: currentBearing,
      pitch: currentPitch
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
