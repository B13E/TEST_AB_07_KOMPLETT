// Import required libraries and functions
import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

// Define frequently used HTML elements
const { div, button, input, table, tr, th, td } = hh(h);

// Define message types used in the program
const MESSAGES = {
  INPUT_FIELD_UPDATE: "INPUT_FIELD_UPDATE",
  ADD_LOCATION: "ADD_LOCATION",
  REMOVE_LOCATION: "REMOVE_LOCATION",
  DISPLAY_WEATHER_DATA: "DISPLAY_WEATHER_DATA"
};

// Fetch weather data from an API
async function fetchWeatherData(dispatch, location) {
  const API_KEY = "933e26c3722a6072bd3b212093310f64";
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`);
    if (response.ok) {
      const data = await response.json();
      const { temp, temp_min, temp_max } = data.main;
      dispatch({ type: MESSAGES.DISPLAY_WEATHER_DATA, payload: { location, temperature: temp, temp_min, temp_max } });
    }
  } catch (error) {
    console.error("Location not found");
  }
}

// Create the user interface
function createView(dispatch, model) {
  return div({}, [
    // Input field for location
    input({
      type: "text",
      placeholder: "Enter a location",
      oninput: (event) => dispatch({ type: MESSAGES.INPUT_FIELD_UPDATE, value: event.target.value }),
      value: model.storedInput,
    }),
    // Button to add location and fetch weather data
    button({
      onclick: () => {
        dispatch({ type: MESSAGES.ADD_LOCATION });
        fetchWeatherData(dispatch, model.storedInput);
      },
      style: {
        backgroundColor: '#fff',
        color: 'white',
        padding: '5px 10px',
        margin: '5px',
        borderRadius: '5px',
      }
    }, "✅"),

    // Table for displaying weather data
    model.locationList.length > 0 ? table({}, [
      tr({}, [th({}, '📍'), th({}, '🌡️'), th({}, '❄️'), th({}, '☀️')]),
      ...model.locationList.map((entry, index) =>
        tr(
          { key: index },
          [
            // Show location and temperature
            td({ style: { padding: '10px' } }, entry.location),
            td({ style: { padding: '10px' } }, `${entry.temperature}°C`),
            // Show minimum and maximum temperature
            td({ style: { padding: '10px' } }, `${entry.temp_min}°C`),
            td({ style: { padding: '10px' } }, `${entry.temp_max}°C`),
            // Button to remove location
            td({}, button({
              onclick: () => dispatch({ type: MESSAGES.REMOVE_LOCATION, index }),
              style: {
                backgroundColor: '#fff',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
              }
            }, "❌"))
          ]
        )
      )
    ]) : null
  ]);
}

// Update the model based on received messages
function updateModel(message, model) {
  switch (message.type) {
    case MESSAGES.INPUT_FIELD_UPDATE:
      return { ...model, storedInput: message.value };
    case MESSAGES.ADD_LOCATION:
      return { ...model, storedInput: "" };
    case MESSAGES.REMOVE_LOCATION:
      return {
        ...model,
        locationList: model.locationList.filter((_, index) => index !== message.index),
      };
    case MESSAGES.DISPLAY_WEATHER_DATA:
      const temperature = Math.round(message.payload.temperature);
      const temp_min = Math.round(message.payload.temp_min);
      const temp_max = Math.round(message.payload.temp_max);
      const location = message.payload.location;
      return {
        ...model,
        locationList: [...model.locationList, { location, temperature, temp_min, temp_max }],
      };
    default:
      return model;
  }
}

// Start the application
function startApp(initialModel, updateModel, createView, containerElement) {
  let model = initialModel;
  let currentView = createView(dispatch, model);
  let rootElement = createElement(currentView);
  containerElement.appendChild(rootElement);

  function dispatch(message) {
    model = updateModel(message, model);
    const updatedView = createView(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootElement = patch(rootElement, patches);
    currentView = updatedView;
  }
}

// Initial values of the application (Empty string and Empty array)
const initialModel = {
  storedInput: "",
  locationList: [],
};

// Find the HTML element with the ID "app" to embed the application
const rootElement = document.getElementById("app");

// Start the application
startApp(initialModel, updateModel, createView, rootElement);
