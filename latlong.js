"use strict";

var initGoogleMapsQuestion = function(questionId, questionContainer) {
  var inputElement = document.getElementById("QR~" + questionId);
  if (!inputElement) {
    throw new Error("Could not find input for question with id " + questionId + ".");
  }
  inputElement.style.display = "none";

  function updateMarkerPosition(markerIndex, position) {
    markers[markerIndex] = position;
    inputElement.value = JSON.stringify(markers);
  }

  var questionBody = questionContainer.querySelector(".QuestionBody") || questionContainer;
  var styleElement = document.createElement("style");
  document.head.appendChild(styleElement);

  var mapElement = document.createElement("div");
  mapElement.setAttribute("id", questionId + "-map");
  if (mapOptions.css) {
    styleElement.innerText += "#" + questionId + "-map {" + mapOptions.css + "}";
    mapElement.setAttribute("style", mapOptions.css);
  } else {
    styleElement.innerText += "#" + questionId + "-map { height: 300px; }";
  }
  questionBody.appendChild(mapElement);

  var map = new google.maps.Map(mapElement, mapOptions.options);

  if (markers) {
    markers.forEach(function(markerData, index) {
      var markerOptions = Object.assign({}, markerData.options);
      markerOptions.map = map;
      markerOptions.position = index in markers ? markers[index] : markerOptions.position || mapOptions.options.center;

      var marker = new google.maps.Marker(markerOptions);

      if (markerData.autocomplete && markerData.autocomplete.enabled) {
        var autocompleteId = questionId + "-" + index + "-locationInput";

        var labelElement = document.createElement("label");
        labelElement.setAttribute("for", autocompleteId);
        labelElement.setAttribute("id", autocompleteId + "-label");
        labelElement.setAttribute("class", "QuestionText");
        if (markerData.autocomplete.labelCss) {
          styleElement.innerText += "#" + autocompleteId + "-label {" + markerData.autocomplete.labelCss + "}";
        }
        labelElement.innerText = markerData.autocomplete.label || markerOptions.title || "Marker " + (markerOptions.label ? markerOptions.label : index);
        questionBody.appendChild(labelElement);

        var inputElement = document.createElement("input");
        inputElement.setAttribute("id", autocompleteId);
        inputElement.setAttribute("class", "InputText");
        if (markerData.autocomplete.css) {
          styleElement.innerText += "#" + autocompleteId + " {" + markerData.autocomplete.css + "}";
        }
        questionBody.appendChild(inputElement);

        var autocomplete = new google.maps.places.Autocomplete(inputElement);
        google.maps.event.addListener(autocomplete, "place_changed", function() {
          var place = autocomplete.getPlace();
          if (place.geometry) {
            marker.setPosition(place.geometry.location);
            map.panTo(place.geometry.location);
            updateMarkerPosition(index, place.geometry.location);
          } else {
            alert(markerData.autocomplete.invalidLocationAlertText || "Invalid Location");
          }
        });
      }

      if (index === 0 && markers.filter(function(marker) { return marker.options.draggable; }).length === 1) {
        google.maps.event.addListener(map, "click", function(event) {
          updateMarkerPosition(index, event.latLng);
          marker.setPosition(event.latLng);
        });
      }

      google.maps.event.addListener(marker, "dragend", function(event) {
        updateMarkerPosition(index, event.latLng);
      });
    });
  }
};

window.initGoogleMapsQuestion = initGoogleMapsQuestion;
