HSV_TT.sockets = {};

HSV_TT.sockets.init = function() {
  const socket = io.connect();
  const location = { lat: null, lng: null }; // this was reversed... Western Hemisphere is negative...
  const nextStopSeq = 1;
  let trolleyOn = true;

  function updateMap(data) {
    for (let i = 0, len = data.length; i < len; i++) {
      if (data[i].lat && data[i].long) {
        location.lat = data[i].lat;
        location.lng = data[i].long;
        HSV_TT.map.updateLocationMarker(data[i].id, location);
      } else {
        console.log(
          `${location.lat}:${location.lng} remove marker: ${data[i].id}`
        );
        HSV_TT.map.removeLocationMarker(data[i].id);
        HSV_TT.removeBusMapMarker(data[i].id);
      }
    }
  }

  function receiveUpdates() {
    console.log("Initializing location updates");
    socket.on("made connect", data => {
      console.log(`${data.greet}, next stop is: ${data.nextSeq}`);
      console.log(`---> url: ${window.location.href}`);
      HSV_TT.ui.setNextStop(data.nextSeq, data.route, data.id);
    });
    socket.on("location update", data => {
      console.log(`New locations received: ${JSON.stringify(data)}`);
      updateMap(data);
    });
    socket.on("trolley off", data => {
      if (trolleyOn) {
        // alert("The Trolley is currently not operating. \n\nNormal hours of operation:\nFriday - //Saturday\n5:00pm - Midnight");
        HSV_TT.ui.showNotAvail();
      }
      trolleyOn = false;
      // trolleyOn = true; // temp
    });
    socket.on("next stop", data => {
      if (data) {
        console.log(
          `next stop changed: ${data.seq} : ${data.route} : ${data.id}`
        );
        HSV_TT.ui.setNextStop(data.seq, data.route, data.id);
      }
    });
  }

  function userMakers() {
    // generate unique user id
    const userId = Math.random()
      .toString(16)
      .substring(2, 15);

    const info = $("#infobox");
    const doc = $(document);

    let sentData = {};

    const connects = {};
    const markers = {};
    let active = false;

    socket.on("load:coords", data => {
      if (!(data.id in connects)) {
        HSV_TT.map.setMarker(data);
      }

      connects[data.id] = data;
      connects[data.id].updated = $.now();
    });

    // check whether browser supports geolocation api
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(positionSuccess, positionError, {
        enableHighAccuracy: true
      });
    } else {
      $("#transitMap").text(
        "Your browser is out of fashion, there's no geolocation!"
      );
    }

    function positionSuccess(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acr = position.coords.accuracy;

      HSV_TT.map.markUserPosition(lat, lng, userId);
      // mark user's position

      let emit = $.now();
      // send coords on when user is active
      doc.on("mousemove", () => {
        active = true;

        sentData = {
          id: userId,
          active,
          coords: [
            {
              lat,
              lng,
              acr
            }
          ]
        };

        if ($.now() - emit > 30) {
          socket.emit("send:coords", sentData);
          emit = $.now();
        }
      });
    }

    doc.bind("mouseup mouseleave", () => {
      active = false;
    });

    // handle geolocation api errors
    function positionError(error) {
      const errors = {
        1: "Authorization fails", // permission denied
        2: "Can't detect your location", // position unavailable
        3: "Connection timeout" // timeout
      };
      showError(`Error:${errors[error.code]}`);
    }

    function showError(msg) {
      info.addClass("error").text(msg);

      doc.click(() => {
        info.removeClass("error");
      });
    }

    // delete inactive users every 15 sec
    setInterval(() => {
      for (const ident in connects) {
        if ($.now() - connects[ident].updated > 15000) {
          delete connects[ident];
          map.removeLayer(markers[ident]);
        }
      }
    }, 15000);
  }

  receiveUpdates();
  userMakers();

  function updateLocation() {
    if (/* trolleyOn */ true) {
      socket.emit("get location");
    }
    // console.log('Location request sent');
  }
  const interval = setInterval(() => {
    updateLocation();
  }, 500);
};
