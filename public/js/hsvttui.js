HSV_TT.ui = {
  nextStop: 0
};

HSV_TT.ui.closeMenu = function() {
  $(".popupContent").css("display", "none");
  $(".leaflet-bottom").css("display", "block");
  $("#menuPopup").css("display", "none");
};

HSV_TT.ui.showSchedule = function() {
  const dtStops = HSV_TT.ui.getStops("Downtown"); // TODO this needs to be more generic, for selected route
  $("#menuPopup").css("display", "block");
  $(".leaflet-bottom").css("display", "none");
  $(".popupContent").css("display", "none");
  $("#stopList").empty();
  for (let i = 0; i < dtStops.length; i++) {
    $("#stopList").append(
      `<li id="st_${i}" class="aStop" data="${
        dtStops[i].geometry.coordinates
      }">${dtStops[i].properties.Stop_Location}&nbsp; at ${
        dtStops[i].properties.Time_
      }</li>`
    );
  }
  $("#stopTimes").css("display", "block");
  if (HSV_TT.ui.nextStop) {
    $(".stopActive").removeClass("stopActive");
    $(`#st_${HSV_TT.ui.nextStop}`).addClass("stopActive");
  }
};

HSV_TT.ui.showNotAvail = function() {
  $("#menuPopup").css("display", "block");
  $(".leaflet-bottom").css("display", "none");
  $(".popupContent").css("display", "none");
  $("#stopList").empty();
  $("#noavail").css("display", "block");
};
// I think we need a HSV_TT.data javascript js... of data manipulation functions the two function below should go there...
HSV_TT.ui.setNextStop = function(seqNum, routeName, busId) {
  routeName = routeName || "Downtown";
  busId = busId || 0;
  const stopTable = HSV_TT.ui.getStops(routeName);
  HSV_TT.ui.nextStop = seqNum - 1;
  $(".stopActive").removeClass("stopActive");
  $(`#st_${HSV_TT.ui.nextStop}`).addClass("stopActive");
};

HSV_TT.ui.getStops = function(routename) {
  const _stops = $.grep(
    allStops.features,
    (o, i) => o.properties.RouteName === routename
  );
  const orderedStops = _stops.sort(
    (a, b) => a.properties.Stop_Sequence - b.properties.Stop_Sequence
  );

  return _stops;
};

HSV_TT.ui.getRoutes = function(routename) {
  const _routes = $.grep(
    allRoutes.features,
    (o, i) => o.properties.RouteName === routename
  );
  return _routes;
};
