HSV_TT = {};

function bus(id, marker) {
  this.id = id;
  this.marker = marker;
}

const buses = [];

$(document).ready(() => {
  HSV_TT.fitWindow();
  $("#slideMenu").click(function() {
    if ($("#menuPopup").css("display") != "none") {
      $("#menuPopup").css("display", "none");
    }
    if ($(this).hasClass("closed")) {
      $(this).animate({ right: "0" }, "slow");
      $("#menuIcon img").attr("src", "/images/menuClose.png");
      $("#menuIcon").css("margin", "0");
      $(this).css("width", "90px");
      $(this).removeClass("closed");
    } else {
      $(this).animate({ right: "-80px" }, "slow");
      $(this).css("width", "120px");
      $("#menuIcon").css("margin", "10px");
      $("#menuIcon img").attr("src", "/images/menuIcon.png");
      $(this).addClass("closed");
    }
  });

  $(document).on("click", "#schedule", () => {
    HSV_TT.showSchedule();
  });

  $(document).on("click", "#scheduleItem", () => {
    HSV_TT.showSchedule();
  });

  $(document).on("click", ".aStop", function() {
    HSV_TT.locateStop($(this).attr("data"));
  });

  $(document).on("click", "#aboutItem", () => {
    $("#menuPopup").css("display", "block");
    $(".leaflet-bottom").css("display", "none");
    $(".popupContent").css("display", "none");
    $("#about").css("display", "block");
  });

  $(document).on("click", "#sponsorsItem", () => {
    $("#menuPopup").css("display", "block");
    $(".leaflet-bottom").css("display", "none");
    $(".popupContent").css("display", "none");
    $("#sponsors").css("display", "block");
  });

  $(document).on("click", "#disPage", () => {
    $("#menuPopup").css("display", "block");
    $(".leaflet-bottom").css("display", "none");
    $(".popupContent").css("display", "none");
    $("#terms").css("display", "block");
  });

  $(document).on("click tap", "#menuPopup img", () => {
    HSV_TT.closeMenu();
  });

  $(document).on("swipeleft swiperight", "#menuPopup", () => {
    HSV_TT.closeMenu();
  });

  $(".link").click(function() {
    window.open($(this).attr("data"), "_blank");
    HSV_TT.closeMenu();
  });

  $(window).resize(HSV_TT.fitWindow);

  HSV_TT.fitWindow();
});

function onMapClick(e) {
  console.log(`[${e.latlng.toString()}]`);
}

HSV_TT.fitWindow = function() {
  const bh = $("body").height();
  const chh = $("#contentHead").height();
  const ch = $("#content").height();

  $("#transitMap").height(bh - (chh + ch));
};

HSV_TT.closeMenu = function() {
  HSV_TT.ui.closeMenu();
};

HSV_TT.showSchedule = function() {
  HSV_TT.ui.showSchedule();
};

HSV_TT.locateStop = function(data) {
  HSV_TT.map.recenterMap(data.split(","));
  HSV_TT.ui.closeMenu();
};

HSV_TT.getBusMapMarker = function(vid) {
  retObj = null;
  for (let i = 0; i < buses.length; i++) {
    if (buses[i].id === vid) {
      rt = buses[i].marker;
      retObj = rt;
    }
  }
  return retObj;
};

HSV_TT.getBusIndexMarker = function(vid) {
  let retn = null;
  for (let i = 0; i < buses.length; i++) {
    if (buses[i].id === vid) {
      retn = i;
    }
  }
  return retn;
};

HSV_TT.putBusMapMarker = function(vid, mapMarker) {
  buses.push(new bus(vid, mapMarker));
  console.log("added a bus...");
};

HSV_TT.removeBusMapMarker = function(vid) {
  const indx = HSV_TT.getBusIndexMarker(vid);
  if (indx > -1) {
    buses.splice(indx, 1);
  }
  console.log("removed a bus...");
};

HSV_TT.getBusesOnRoute = function(routeId) {
  // TODO: implement
};
