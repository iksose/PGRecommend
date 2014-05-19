"use strict";
var app = angular.module('uiRouterSample', ['angular-table']).run(['$rootScope', function($rootScope) {}]);
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
        console.log("Filter for", key, "is true, do this");
        var firstRun = true;
        var rejectedArray = jesus.length > 0 ? jesus : [];
        var firstRunMaster = jesus.length > 0 ? jesus : $scope.$parent.myPurchases_copy;
        console.log("Value of jesus on second pass", rejectedArray.length);
        for (var i = 0; i < $scope.filters[$traceurRuntime.toProperty(key)].text.length; i++) {
          if (!firstRun) {
            console.log("On second run...", i);
            var without = _.reject(rejectedArray, function(obj) {
              return obj.RecoType == $scope.filters[$traceurRuntime.toProperty(key)].text[$traceurRuntime.toProperty(i)];
            });
            rejectedArray = without;
          }
          if (firstRun) {
            console.log("On first run...", i);
            console.log(firstRunMaster.length);
            var without = _.reject(firstRunMaster, function(obj) {
              return obj.RecoType == $scope.filters[$traceurRuntime.toProperty(key)].text[$traceurRuntime.toProperty(i)];
            });
            rejectedArray = without;
            var firstRun = false;
          }
        }
        var jesus = rejectedArray;
        console.log("Done with first filter for", key, jesus);
        $scope.$parent.myPurchases = rejectedArray;
      }
    }
    if (!do_any_of_my_objects_have_a_true_filter) {
      console.log("No filters...");
      $scope.$parent.myPurchases = $scope.$parent.myPurchases_copy;
    }
    $scope.$parent.destroy();
    setTimeout(function() {
      $scope.$parent.ammendment();
    }, 100);
  };
});
angular.module('uiRouterSample').controller('TodoCtrl', function($scope, recoFactory, $window, $rootScope) {
  $scope.myPurchases = {};
  $scope.myPurchases_copy = {};
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
      newArray.push(obj);
    });
    $scope.myPurchases = newArray;
    $scope.myPurchases_copy = newArray;
    check_for_illicit_items();
    $scope.pagination[3].shade = newArray.length;
  });
  $scope.myRecommendations = {};
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
  });
  $scope.selectChanged = function(dur) {
    console.log("select changed", $scope.tableConfig.itemsPerPage, " old ", dur.shade, " new");
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
      $scope.destroy($scope.tableConfig.itemsPerPage);
      setTimeout(function() {
        $scope.ammendment();
      }, 100);
    }
  });
  $scope.ammendment = function() {
    var available = $scope.tableConfig.itemsPerPage;
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 0; i < available; i++) {
      var new_row = myTable.insertRow(myRows[$traceurRuntime.toProperty(i)].rowIndex + 1);
      new_row.id = "row" + i;
      new_row.insertCell(0).innerHTML = '<input type="radio" class="hideSuggest" data-rowid=' + myRows[$traceurRuntime.toProperty(i)].id + '> <small>Hide</small>';
      new_row.insertCell(1).innerHTML = "Recommendation";
      new_row.cells[1].className = "Bubba";
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      new_row.insertCell(2).innerHTML = match.NDC;
      new_row.insertCell(3).innerHTML = match.Descr;
      new_row.insertCell(4).innerHTML = match.MfgName;
      new_row.insertCell(5).innerHTML = match.Form;
      new_row.insertCell(6).innerHTML = match.Str;
      new_row.insertCell(7).innerHTML = match.Size;
      new_row.insertCell(8).innerHTML = "";
      new_row.insertCell(9).innerHTML = "$" + parseFloat(match.RecSalesPrice).toFixed(2);
      new_row.insertCell(10).innerHTML = "$" + parseFloat(match.RecTotal).toFixed(2);
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      if (myPurch.checked == true) {
        document.getElementById('checkbox' + myRows[$traceurRuntime.toProperty(i)].id).checked = true;
      }
      new_row.insertCell(11).innerHTML = myPurch.TotalSavings;
      new_row.cells[11].className = "bold";
      new_row.insertCell(12).innerHTML = match.RecoType;
      new_row.cells[12].className = "bold";
      new_row.insertCell(13).innerHTML = "$" + parseFloat(myPurch.TotalSavings).toFixed(2);
      new_row.cells[13].className = "bold";
    }
    ;
    $scope.applyEvents();
  };
  function check_for_illicit_items() {
    var myBannedItems;
    try {
      myBannedItems = JSON.parse(localStorage[$traceurRuntime.toProperty("PBA Profitguard")]);
    } catch (e) {
      return;
    }
    var acceptableItems = $scope.myPurchases;
    var now = Date.parse(new Date());
    for (var i = 0; i < myBannedItems.length; i++) {
      if (Date.parse(myBannedItems[$traceurRuntime.toProperty(i)].storeDate) > now) {
        var terminated_suspects = _.reject(acceptableItems, function(obj) {
          return obj.RowID == myBannedItems[$traceurRuntime.toProperty(i)].rowID;
        });
        acceptableItems = terminated_suspects;
      } else {
        myBannedItems.pop(i);
        i--;
      }
      $traceurRuntime.setProperty(localStorage, "PBA Profitguard", JSON.stringify(myBannedItems));
      $scope.myPurchases = acceptableItems;
    }
  }
  var bannedItems = [];
  $scope.applyEvents = function() {
    var events = document.getElementsByClassName('hideSuggest');
    for (var i = 0; i < events.length; i++) {
      angular.element(events[$traceurRuntime.toProperty(i)]).on('click', function(ev) {
        ev.preventDefault();
        return false;
        console.log(ev);
        var element = this.dataset.rowid;
        var date = new Date();
        var numberOfDaysToAdd = 30;
        date.setDate(date.getDate() + numberOfDaysToAdd);
        var store = {
          storeDate: date.toDateString(),
          rowID: element
        };
        bannedItems.push(store);
        $traceurRuntime.setProperty(localStorage, "PBA Profitguard", JSON.stringify(bannedItems));
      });
    }
  };
  $scope.destroy = function(amount) {
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 1; i <= myRows.length; i++) {
      myTable.rows[$traceurRuntime.toProperty(i + 1)].remove();
    }
  };
  $scope.selected = 0;
});
angular.module('uiRouterSample').controller('printCtrl2', function($scope, $filter, $window, $rootScope) {
  $scope.addPrint = function(rowTargID, $event) {
    if ($event.target.type == "checkbox") {
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
  $scope.selected = 0;
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
  console.log("Welcome to the print Controller");
  $scope.printText = sessionStorage.printText;
  $scope.myPurchases = JSON.parse(sessionStorage.purchases);
  $scope.myRecommendations = JSON.parse(sessionStorage.recommendations);
  ;
  setTimeout(function() {
    ammendment();
  }, 100);
  setTimeout(function() {
    window.print();
  }, 500);
  $scope.colors = [{
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
    shade: 1000
  }];
  $scope.myColor = $scope.colors[0];
  $scope.tableConfig = {
    itemsPerPage: 1000,
    fillLastPage: false,
    oldAmount: $scope.myColor.name
  };
  function ammendment() {
    var available = $scope.tableConfig.itemsPerPage;
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 0; i < available; i++) {
      var new_row = myTable.insertRow(myRows[$traceurRuntime.toProperty(i)].rowIndex + 1);
      new_row.id = "row" + i;
      new_row.insertCell(0).innerHTML = '<input type="radio" class="hideSuggest" data-rowid=' + myRows[$traceurRuntime.toProperty(i)].id + '> <small>Hide</small>';
      new_row.insertCell(1).innerHTML = "Recommendation";
      new_row.cells[1].className = "Bubba";
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      new_row.insertCell(2).innerHTML = match.NDC;
      new_row.insertCell(3).innerHTML = match.Descr;
      new_row.insertCell(4).innerHTML = match.MfgName;
      new_row.insertCell(5).innerHTML = match.Form;
      new_row.insertCell(6).innerHTML = match.Str;
      new_row.insertCell(7).innerHTML = match.Size;
      new_row.insertCell(8).innerHTML = "";
      new_row.insertCell(9).innerHTML = "$" + parseFloat(match.RecSalesPrice).toFixed(2);
      new_row.insertCell(10).innerHTML = "$" + parseFloat(match.RecTotal).toFixed(2);
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      new_row.insertCell(11).innerHTML = myPurch.TotalSavings;
      new_row.cells[11].className = "bold";
      new_row.insertCell(12).innerHTML = match.RecoType;
      new_row.cells[12].className = "bold";
      new_row.insertCell(13).innerHTML = "$" + myPurch.TotalSavings;
      new_row.cells[13].className = "bold";
    }
    ;
  }
});
