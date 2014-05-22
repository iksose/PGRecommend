"use strict";
var app = angular.module('uiRouterSample', ['angular-table', 'toggle-switch']).run(['$rootScope', function($rootScope) {}]);
angular.module('uiRouterSample').factory('recoFactory', function($http, $rootScope) {
  var psCustID = document.getElementsByClassName("dvCustId")[0].innerText;
  return {
    getPurchases: function(url) {
      return $http.get('/_vti_bin/ProfitguardRecommendationsWCF.svc/GetPurchases/' + psCustID);
    },
    getRecommendations: function(url) {
      return $http.get('/_vti_bin/ProfitguardRecommendationsWCF.svc/GetRecommendations/' + psCustID);
    }
  };
});
angular.module('uiRouterSample').controller('filters', function($scope, $filter, $window, $rootScope) {
  $scope.filters = {};
  $traceurRuntime.setProperty($scope.filters, "Primary Wholesaler", {
    enabled: false,
    text: ["Endorsed Wholesaler Contract to PBA", "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract", "Endorsed Wholesaler Contract to Endorsed Wholesaler Contract", "Endorsed Wholesaler Non-Contract to PBA"]
  });
  $traceurRuntime.setProperty($scope.filters, "From PBA", {
    enabled: false,
    text: ["PBA to Endorsed Wholesaler Contract"]
  });
  $traceurRuntime.setProperty($scope.filters, "Source", {
    enabled: false,
    text: ["Endorsed Wholesaler Contract to PBA", "Endorsed Wholesaler Contract to Endorsed Wholesaler Contract", "PBA to Endorsed Wholesaler Contract"]
  });
  $traceurRuntime.setProperty($scope.filters, "Non Contract", {
    enabled: false,
    text: ["Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract", "Endorsed Wholesaler Non-Contract to PBA"]
  });
  $scope.filterClick = function(string, event) {
    var filter = string;
    if ($scope.showValue == 0) {
      console.log("compact view sort");
      $scope.destroy();
      var myTable = document.getElementById("queryTable");
      var myRows = document.getElementsByClassName("mainRows");
      for (var i = 0; i < myRows.length; i++) {
        var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
        var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
        myRows[$traceurRuntime.toProperty(i)].cells[0].innerHTML = myPurch.NDC;
      }
      var myRows = "";
    }
    var element = document.getElementById(event.target.id);
    if ($scope.filters[$traceurRuntime.toProperty(filter)].enabled == true) {
      $scope.filters[$traceurRuntime.toProperty(filter)].enabled = false;
      element.className = event.target.id;
    } else {
      $scope.filters[$traceurRuntime.toProperty(filter)].enabled = true;
      element.className += " " + event.target.id + "Red";
    }
    $scope.ammend();
  };
  $scope.ammend = function() {
    var allMatches = [];
    var jesus = [];
    var do_any_of_my_objects_have_a_true_filter = false;
    for (var key in $scope.filters) {
      if ($scope.filters[$traceurRuntime.toProperty(key)].enabled) {
        do_any_of_my_objects_have_a_true_filter = true;
        var firstRun = true;
        var rejectedArray = jesus.length > 0 ? jesus : [];
        var firstRunMaster = jesus.length > 0 ? jesus : $scope.$parent.myPurchases_copy;
        for (var i = 0; i < $scope.filters[$traceurRuntime.toProperty(key)].text.length; i++) {
          if (!firstRun) {
            var without = _.reject(rejectedArray, function(obj) {
              return obj.RecoType == $scope.filters[$traceurRuntime.toProperty(key)].text[$traceurRuntime.toProperty(i)];
            });
            rejectedArray = without;
          }
          if (firstRun) {
            var without = _.reject(firstRunMaster, function(obj) {
              return obj.RecoType == $scope.filters[$traceurRuntime.toProperty(key)].text[$traceurRuntime.toProperty(i)];
            });
            rejectedArray = without;
            var firstRun = false;
          }
        }
        var jesus = rejectedArray;
        $scope.$parent.myPurchases = rejectedArray;
      }
    }
    if (!do_any_of_my_objects_have_a_true_filter) {
      $scope.$parent.myPurchases = $scope.$parent.myPurchases_copy;
    }
    if ($scope.showValue == 1) {
      $scope.$parent.destroy();
      setTimeout(function() {
        $scope.$parent.ammendment();
      }, 100);
    } else if ($scope.showValue == 0) {
      setTimeout(function() {
        var myRows = [];
        var myTable = document.getElementById("queryTable");
        var myRows = document.getElementsByClassName("mainRows");
        for (var i = 0; i < myRows.length; i++) {
          var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
          var myPurch = _.findWhere($scope.$parent.myPurchases_copy, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
          myRows[$traceurRuntime.toProperty(i)].cells[0].innerHTML = myPurch.NDC + "<button class='btn btn-info btn-sm' id='b" + match.RowID + "'>Recommendations</button>";
          myRows[$traceurRuntime.toProperty(i)].cells[0].id = match.RowID;
          angular.element(myRows[$traceurRuntime.toProperty(i)].cells[0]).on('click', function(ev) {
            var theID = ev.target.id.substring(1);
            var match = _.findWhere($scope.myRecommendations, {RowID: theID});
            var subRows = document.getElementsByClassName('subRow');
            for (var i = 0; i < subRows.length; i++) {
              subRows[$traceurRuntime.toProperty(i)].remove();
            }
            $scope.miniAmmend(theID, match);
          });
        }
      }, 100);
    }
  };
});
angular.module('uiRouterSample').controller('TodoCtrl', function($scope, recoFactory, $window, $rootScope) {
  $scope.myPurchases = [];
  $scope.myPurchases_copy = {};
  $scope.selected = 0;
  recoFactory.getPurchases().then(function(data) {
    var newArray = [];
    data.data.aaData.forEach(function(obj, index) {
      obj.TotalSavings = parseFloat(parseFloat(obj.TotalSavings).toFixed(2));
      if (obj.RecoType == "PBA to Endorsed Wholesaler Contract") {
        obj.RecoType_small = "PBA Health";
      } else if (obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA") {
        obj.RecoType_small = "Primary Wholesaler";
      }
      obj.SalesPrice = parseFloat(obj.SalesPrice).toFixed(2);
      obj.Total = parseFloat(obj.Total).toFixed(2);
      obj.TotalSavings2 = parseFloat(obj.TotalSavings).toFixed(2);
      newArray.push(obj);
    });
    $scope.myPurchases = newArray;
    $scope.myPurchases_copy = newArray;
    if ($scope.myRecommendations.length > 0) {
      $scope.blender;
    }
    $scope.pagination[3].shade = newArray.length;
  });
  $scope.myRecommendations = [];
  recoFactory.getRecommendations().then(function(data) {
    var newArray = [];
    data.data.aaData.forEach(function(obj, index) {
      if (obj.RecoType == "Endorsed Wholesaler Contract to PBA") {
        obj.RecoType = "PBA Health";
      } else if (obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA") {
        obj.RecoType = "Primary Wholesaler";
      } else if (obj.RecoType == "PBA to Endorsed Wholesaler Contract") {
        obj.RecoType = "Primary Wholesaler";
      }
      newArray.push(obj);
    });
    $scope.myRecommendations = newArray;
    $scope.ammendment();
    $scope.blender();
  });
  $scope.selectChanged = function(dur) {
    $scope.tableConfig.oldAmount = $scope.tableConfig.itemsPerPage;
    $scope.tableConfig.itemsPerPage = dur.shade;
    $scope.destroy();
    setTimeout(function() {
      $scope.ammendment();
    }, 100);
  };
  $scope.pagination = [{
    name: 5,
    shade: 5
  }, {
    name: 10,
    shade: 10
  }, {
    name: 20,
    shade: 20
  }, {
    name: "All",
    shade: 3
  }];
  $scope.myPagination = $scope.pagination[0];
  $scope.tableConfig = {
    itemsPerPage: $scope.myPagination.shade,
    fillLastPage: false,
    maxPages: 10,
    oldAmount: $scope.myPagination.shade
  };
  $scope.tableConfig.currentPage = 1;
  $scope.$watch('tableConfig.currentPage', function(newVal, oldVal) {
    if (newVal !== oldVal) {
      if ($scope.showValue == 0) {
        $scope.destroy();
        setTimeout(function() {
          var myTable = document.getElementById("queryTable");
          var myRows = document.getElementsByClassName("mainRows");
          for (var i = 0; i < myRows.length; i++) {
            var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
            console.log(match.Descr);
            var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
            myRows[$traceurRuntime.toProperty(i)].cells[0].innerHTML = myPurch.NDC + "<button class='btn btn-info btn-sm' id='b" + match.RowID + "'>Recommendations</button>";
            myRows[$traceurRuntime.toProperty(i)].cells[0].id = match.RowID;
            angular.element(myRows[$traceurRuntime.toProperty(i)].cells[0]).on('click', function(ev) {
              var theID = ev.target.id.substring(1);
              var match = _.findWhere($scope.myRecommendations, {RowID: theID});
              var subRows = document.getElementsByClassName('subRow');
              for (var i = 0; i < subRows.length; i++) {
                subRows[$traceurRuntime.toProperty(i)].remove();
              }
              $scope.miniAmmend(theID, match);
            });
          }
        }, 100);
        return;
      }
      $scope.destroy($scope.tableConfig.itemsPerPage);
      setTimeout(function() {
        $scope.ammendment();
      }, 100);
    }
  });
  $scope.ammendment = function() {
    if ($scope.myPurchases.length == 0 || $scope.myRecommendations == 0) {
      setTimeout(function() {
        $scope.ammendment();
      }, 1000);
      return;
    }
    var available = $scope.tableConfig.itemsPerPage;
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 0; i < available; i++) {
      var new_row = myTable.insertRow(myRows[$traceurRuntime.toProperty(i)].rowIndex + 1);
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      new_row.id = "row" + i;
      new_row.className = "subRow";
      var recommendation_row = new_row.insertCell(0);
      recommendation_row.colSpan = 11;
      recommendation_row.innerHTML = '<p class="printBoxes smaller" ><input type="checkbox" data-rowid="' + myPurch.RowID + '" id="checkbox' + myPurch.RowID + '"> Print? </p>' + "<p class='recSupply'>Recommendation: " + match.NDC + "</p> " + "<p>MFG: " + " " + match.MfgName + "</p> " + "<p class='smaller'>Size: " + match.Size + "</p> " + " " + "<p class='smaller'>Price: " + " " + "$" + match.RecSalesPrice + "</p> " + "<p class='recSupply'>Supplier: " + " " + match.RecoType + "</p> ";
      new_row.cells[0].className = "Bubba";
      if (myPurch.checked == true) {
        document.getElementById('checkbox' + myRows[$traceurRuntime.toProperty(i)].id).checked = true;
      }
    }
    ;
    $scope.applyEvents();
  };
  $scope.applyEvents = function() {
    var available = $scope.tableConfig.itemsPerPage;
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("printBoxes");
    for (var i = 0; i < myRows.length; i++) {
      angular.element(myRows[$traceurRuntime.toProperty(i)]).on('click', function(ev) {
        var checkbox = document.getElementById(ev.target.id);
        var rowid = ev.target.dataset.rowid;
        if (checkbox.checked) {
          var match = _.findWhere($scope.myPurchases, {RowID: rowid});
          match.checked = checkbox.checked;
          $scope.$apply(function() {
            $scope.selected++;
          });
        } else {
          var match = _.findWhere($scope.myPurchases, {RowID: rowid});
          match.checked = checkbox.checked;
          $scope.$apply(function() {
            $scope.selected--;
          });
        }
      });
    }
  };
  $scope.printAll = function() {
    var childWindow = $window;
    childWindow.sessionStorage.purchases = angular.toJson($scope.myPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations);
    childWindow.sessionStorage.printText = "Showing All";
    childWindow.open('/views/printAll.html');
  };
  $scope.printSelected = function() {
    var childWindow = $window;
    var selectedPurchases = _.where($scope.myPurchases, {checked: true});
    childWindow.sessionStorage.purchases = angular.toJson(selectedPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations);
    childWindow.sessionStorage.printText = "Showing " + selectedPurchases.length + " of " + $scope.pagination[3].shade;
    childWindow.open('/views/printAll.html');
  };
  $scope.blender = function() {
    if ($scope.myPurchases.length == 0 || $scope.myRecommendations == 0) {
      setTimeout(function() {
        $scope.blender();
      }, 1000);
      return;
    }
    for (var i = 0; i < $scope.myPurchases.length; i++) {
      var match = _.findWhere($scope.myRecommendations, {RowID: $scope.myPurchases[$traceurRuntime.toProperty(i)].RowID});
      match.UnitPrice = (parseFloat(match.RecSalesPrice) / parseFloat(match.Size)).toFixed(2);
      match.RecSalesPrice = parseFloat(match.RecSalesPrice).toFixed(2);
      $scope.myPurchases[$traceurRuntime.toProperty(i)].Reco = match;
      $scope.myPurchases[$traceurRuntime.toProperty(i)].TotalSavings_string = parseFloat($scope.myPurchases[$traceurRuntime.toProperty(i)].TotalSavings).toFixed(2);
      $scope.myPurchases[$traceurRuntime.toProperty(i)].UnitPrice = (parseInt($scope.myPurchases[$traceurRuntime.toProperty(i)].SalesPrice) / parseInt($scope.myPurchases[$traceurRuntime.toProperty(i)].Size)).toFixed(2);
    }
  };
  $scope.removePrint = function(ev) {
    $scope.selected--;
    var match = _.findWhere($scope.myPurchases, {RowID: ev.target.id});
    match.checked = false;
    var checkbox = document.getElementById("checkbox" + ev.target.id);
    checkbox.checked = false;
  };
  $scope.destroy = function(amount) {
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("subRow");
    for (var i = 0; i < myRows.length; i++) {
      myRows[$traceurRuntime.toProperty(i)].remove();
      i--;
    }
  };
  $scope.showStatus = "Collapse";
  $scope.showValue = 1;
  $scope.magic = function() {
    if ($scope.showValue == 0) {
      $scope.showStatus = "Collapse";
      $scope.showValue = 1;
      $scope.destroy();
      $scope.ammendment();
      var myTable = document.getElementById("queryTable");
      var myRows = document.getElementsByClassName("mainRows");
      for (var i = 0; i < myRows.length; i++) {
        var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
        var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
        myRows[$traceurRuntime.toProperty(i)].cells[0].innerHTML = myPurch.NDC;
      }
    } else {
      $scope.showStatus = "Expand";
      $scope.showValue = 0;
      $scope.destroy();
      var myTable = document.getElementById("queryTable");
      var myRows = document.getElementsByClassName("mainRows");
      for (var i = 0; i < myRows.length; i++) {
        var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
        var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
        myRows[$traceurRuntime.toProperty(i)].cells[0].innerHTML = myPurch.NDC + "<button class='btn btn-info btn-sm' id='b" + match.RowID + "'>Recommendations</button>";
        myRows[$traceurRuntime.toProperty(i)].cells[0].id = match.RowID;
        angular.element(myRows[$traceurRuntime.toProperty(i)].cells[0]).on('click', function(ev) {
          var theID = ev.target.id.substring(1);
          var match = _.findWhere($scope.myRecommendations, {RowID: theID});
          var subRows = document.getElementsByClassName('subRow');
          for (var i = 0; i < subRows.length; i++) {
            subRows[$traceurRuntime.toProperty(i)].remove();
          }
          $scope.miniAmmend(theID, match);
        });
      }
    }
  };
  $scope.miniAmmend = function(rowid, match) {
    console.log("Mini ammend?", rowid);
    var myTable = document.getElementById("queryTable");
    var row = document.getElementById(rowid);
    var myPurch = _.findWhere($scope.myPurchases, {RowID: rowid});
    var new_row = myTable.insertRow(row.rowIndex + 1);
    new_row.id = "row";
    new_row.className = "subRow";
    var recommendation_row = new_row.insertCell(0);
    recommendation_row.colSpan = 11;
    recommendation_row.innerHTML = '<p class="printBoxes smaller" ><input type="checkbox" data-rowid="' + myPurch.RowID + '" id="checkbox' + myPurch.RowID + '"> Print? </p>' + "<p class='recSupply'>Recommendation: " + match.NDC + "</p> " + "<p>MFG: " + " " + match.MfgName + "</p> " + "<p class='smaller'>Size: " + match.Size + "</p> " + " " + "<p class='smaller'>Price: " + " " + "$" + match.RecSalesPrice + "</p> " + "<p class='recSupply'>Supplier: " + " " + match.RecoType + "</p> ";
    if (myPurch.checked == true) {
      document.getElementById('checkbox' + rowid).checked = true;
    }
    $scope.applyEvents();
  };
});
angular.module('uiRouterSample').controller('printCtrl2', function($scope, $filter, $window, $rootScope) {
  $scope.addPrint = function(rowTargID, $event) {
    if ($event.target.type == "checkbox") {
      console.log("CHECKED");
      var match = _.findWhere($scope.myPurchases, {RowID: rowTargID});
      match.checked = document.getElementById('checkbox' + rowTargID).checked;
      if (match.checked)
        $scope.selected++;
      else
        $scope.selected--;
      return;
    }
    if (document.getElementById('checkbox' + rowTargID).checked) {
      document.getElementById('checkbox' + rowTargID).checked = false;
      var match = _.findWhere($scope.myPurchases, {RowID: rowTargID});
      match.checked = false;
      $scope.selected--;
    } else {
      document.getElementById('checkbox' + rowTargID).checked = true;
      var match = _.findWhere($scope.myPurchases, {RowID: rowTargID});
      match.checked = true;
      $scope.selected++;
    }
  };
  $scope.printAll = function() {
    var childWindow = $window;
    childWindow.sessionStorage.purchases = angular.toJson($scope.myPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations);
    childWindow.sessionStorage.printText = "Showing All";
    childWindow.open('/views/printAll.html');
  };
  $scope.printSelected = function() {
    var childWindow = $window;
    var selectedPurchases = _.where($scope.myPurchases, {checked: true});
    childWindow.sessionStorage.purchases = angular.toJson(selectedPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations);
    childWindow.sessionStorage.printText = "Showing " + selectedPurchases.length + " of " + $scope.pagination[3].shade;
    childWindow.open('/views/printAll.html');
  };
});
angular.module('uiRouterSample').controller('print_page_Ctrl', function($scope, $window) {
  $scope.printText = sessionStorage.printText;
  $scope.myPurchases = JSON.parse(sessionStorage.purchases);
  $scope.myRecommendations = JSON.parse(sessionStorage.recommendations);
  for (var i = 0; i < $scope.myPurchases.length; i++) {
    var match = _.findWhere($scope.myRecommendations, {RowID: $scope.myPurchases[$traceurRuntime.toProperty(i)].RowID});
    match.UnitPrice = (parseFloat(match.RecSalesPrice) / parseFloat(match.Size)).toFixed(2);
    match.RecSalesPrice = parseFloat(match.RecSalesPrice).toFixed(2);
    $scope.myPurchases[$traceurRuntime.toProperty(i)].Reco = match;
    $scope.myPurchases[$traceurRuntime.toProperty(i)].TotalSavings_string = parseFloat($scope.myPurchases[$traceurRuntime.toProperty(i)].TotalSavings).toFixed(2);
    $scope.myPurchases[$traceurRuntime.toProperty(i)].UnitPrice = (parseInt($scope.myPurchases[$traceurRuntime.toProperty(i)].SalesPrice) / parseInt($scope.myPurchases[$traceurRuntime.toProperty(i)].Size)).toFixed(2);
  }
  window.print();
});
