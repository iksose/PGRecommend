"use strict";
var app = angular.module('uiRouterSample', ['angular-table']).run(['$rootScope', function($rootScope) {
  $rootScope.psCustID = 1;
  $rootScope.filters = {};
}]);
console.log("hmm");
var evens = [2, 4, 6, 8];
var odds = evens.map((function(v) {
  return v + 1;
}));
var nums = evens.map((function(v, i) {
  return v + i;
}));
console.log("Nums", nums);
var melter = function(obj) {
  var temp = obj;
  temp.melted = "melted";
  return temp;
};
var empty = (function() {});
var Car = function Car(make) {
  this.make = make;
  this.currentSpeed = 25;
};
($traceurRuntime.createClass)(Car, {printCurrentSpeed: function() {
    console.log(this.make + ' is going ' + this.currentSpeed + ' mph.');
  }}, {});
var RaceCar = function RaceCar(make, topSpeed) {
  $traceurRuntime.superCall(this, $RaceCar.prototype, "constructor", [make]);
  this.topSpeed = topSpeed;
};
var $RaceCar = RaceCar;
($traceurRuntime.createClass)(RaceCar, {goFast: function() {
    this.currentSpeed = this.topSpeed;
  }}, {}, Car);
var stang = new RaceCar('Mustang', 150);
var prius = new Car('Prius', 100);
stang.printCurrentSpeed();
stang.goFast();
stang.printCurrentSpeed();
prius.printCurrentSpeed();
var num = 0;
{
  try {
    throw undefined;
  } catch ($i) {
    $i = 0;
    for (; $i < 10; $i++) {
      try {
        throw undefined;
      } catch (i) {
        i = $i;
        try {
          num += i;
          console.log('value of i in block: ' + i);
        } finally {
          $i = i;
        }
      }
    }
  }
}
console.log('Is i defined here?: ' + (typeof i !== 'undefined'));
angular.module('uiRouterSample').factory('recoFactory', function($http, $rootScope) {
  var psCustID = $rootScope.psCustID;
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
  $scope.test = function(event) {
    var filter = event.target.id;
    var something = document.getElementById(filter);
    if ($scope.filters[$traceurRuntime.toProperty(filter)]) {
      delete $scope.filters[$traceurRuntime.toProperty(filter)];
      something.innerText = "Off";
    } else {
      $traceurRuntime.setProperty($scope.filters, filter, true);
      something.innerText = "On";
    }
    $scope.ammend();
  };
  $scope.ammend = function() {
    var allMatches = [];
    for (var key in $scope.filters) {
      var match = _.where($scope.$parent.myPurchases_copy, {MfgName: key});
      allMatches = allMatches.concat(match);
    }
    $scope.$parent.myPurchases = allMatches;
    if (Object.keys($scope.filters).length == 0) {
      $scope.$parent.myPurchases = $scope.$parent.myPurchases_copy;
    }
    $scope.$parent.destroy();
    setTimeout(function() {
      $scope.$parent.ammendment();
    }, 100);
  };
});
angular.module('uiRouterSample').controller('TodoCtrl', function($scope, recoFactory, $window, $rootScope) {
  console.log("Welcome to the Admin Controller");
  $scope.myPurchases = {};
  $scope.myPurchases_copy = {};
  $scope.filters = $rootScope.filters;
  recoFactory.getPurchases().then(function(data) {
    var newArray = [];
    data.data.aaData.forEach(function(obj, index) {
      obj.TotalSavings = parseFloat(parseFloat(obj.TotalSavings).toFixed(2));
      if (obj.RecoType == "PBA to Endorsed Wholesaler Contract") {
        obj.RecoType = "PBA Health";
      } else if (obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA") {
        obj.RecoType = "Primary Wholesaler";
      }
      newArray.push(obj);
    });
    $scope.myPurchases = newArray;
    $scope.myPurchases_copy = newArray;
    $scope.pagination[3].shade = newArray.length;
  });
  $scope.myRecommendations = {};
  recoFactory.getRecommendations().then(function(data) {
    console.log("Recos", data.data.aaData);
    var newArray = [];
    data.data.aaData.forEach(function(obj, index) {
      if (obj.RecoType == "Endorsed Wholesaler Contract to PBA") {
        obj.RecoType = "PBA Health";
      } else if (obj.RecoType == "1Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "1Endorsed Wholesaler Contract to PBA") {
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
      new_row.insertCell(0).innerHTML = "Recommendation";
      new_row.cells[0].className = "Bubba";
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      console.log("MATCH?", match);
      new_row.insertCell(1).innerHTML = match.NDC;
      new_row.insertCell(2).innerHTML = match.Descr;
      new_row.insertCell(3).innerHTML = match.MfgName;
      new_row.insertCell(4).innerHTML = match.Form;
      new_row.insertCell(5).innerHTML = match.Str;
      new_row.insertCell(6).innerHTML = match.Size;
      new_row.insertCell(7).innerHTML = "";
      new_row.insertCell(8).innerHTML = "$" + parseFloat(match.RecSalesPrice).toFixed(2);
      new_row.insertCell(9).innerHTML = "$" + parseFloat(match.RecTotal).toFixed(2);
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      if (myPurch.checked == true) {
        document.getElementById('checkbox' + myRows[$traceurRuntime.toProperty(i)].id).checked = true;
      }
      new_row.insertCell(10).innerHTML = myPurch.TotalSavings;
      new_row.cells[10].className = "bold";
      new_row.insertCell(11).innerHTML = match.RecoType;
      new_row.cells[11].className = "bold";
      new_row.insertCell(12).innerHTML = "$" + myPurch.TotalSavings;
      new_row.cells[12].className = "bold";
    }
    ;
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
  console.log("Welcome to print 2");
  $scope.addPrint = function(arg, $event) {
    if ($event.target.type == "checkbox") {
      var match = _.findWhere($scope.myPurchases, {RowID: arg});
      match.checked = document.getElementById('checkbox' + arg).checked;
      if (match.checked)
        $scope.selected++;
      else
        $scope.selected--;
      return;
    }
    if (document.getElementById('checkbox' + arg).checked) {
      document.getElementById('checkbox' + arg).checked = false;
      var match = _.findWhere($scope.myPurchases, {RowID: arg});
      match.checked = false;
      $scope.selected--;
    } else {
      document.getElementById('checkbox' + arg).checked = true;
      var match = _.findWhere($scope.myPurchases, {RowID: arg});
      match.checked = true;
      $scope.selected++;
    }
  };
  $scope.printAll = function() {
    console.log("Print all?");
    var childWindow = $window;
    childWindow.sessionStorage.purchases = angular.toJson($scope.myPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations);
    childWindow.sessionStorage.printText = "Showing All";
    childWindow.open('/views/printAll.html');
  };
  $scope.selected = 0;
  $scope.printSelected = function() {
    console.log("Print selected?");
    var childWindow = $window;
    var selectedPurchases = _.where($scope.myPurchases, {checked: true});
    childWindow.sessionStorage.purchases = angular.toJson(selectedPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations);
    childWindow.sessionStorage.printText = "Showing " + selectedPurchases.length + " of " + $scope.colors[3].shade;
    childWindow.open('/views/printAll.html');
  };
});
angular.module('uiRouterSample').controller('print_page_Ctrl', function($scope, recoFactory, $window) {
  console.log("Welcome to the print Controller");
  $scope.myPurchases = {};
  $scope.printText = sessionStorage.printText;
  var newArray = [];
  var purchases = JSON.parse(sessionStorage.purchases);
  purchases.forEach(function(obj, index) {
    obj.TotalSavings = parseFloat(parseFloat(obj.TotalSavings).toFixed(2));
    if (obj.RecoType == "PBA to Endorsed Wholesaler Contract") {
      obj.RecoType = "PBA Health";
    } else if (obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA") {
      obj.RecoType = "Primary Wholesaler";
    }
    newArray.push(obj);
  });
  $scope.myPurchases = newArray;
  $scope.myRecommendations = {};
  var newArray = [];
  var recommendations = JSON.parse(sessionStorage.recommendations);
  recommendations.forEach(function(obj, index) {
    if (obj.RecoType == "Endorsed Wholesaler Contract to PBA") {
      obj.RecoType = "PBA Health";
    } else if (obj.RecoType == "1Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "1Endorsed Wholesaler Contract to PBA") {
      obj.RecoType = "Primary Wholesaler";
    }
    newArray.push(obj);
  });
  $scope.myRecommendations = newArray;
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
    var available = purchases.length;
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 0; i < available; i++) {
      var new_row = myTable.insertRow(myRows[$traceurRuntime.toProperty(i)].rowIndex + 1);
      new_row.id = "row" + i;
      new_row.insertCell(0).innerHTML = "Recommend";
      new_row.cells[0].className = "Bubba";
      var match = _.findWhere(recommendations, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      new_row.insertCell(1).innerHTML = match.NDC;
      new_row.insertCell(2).innerHTML = match.Descr;
      new_row.insertCell(3).innerHTML = match.MfgName;
      new_row.insertCell(4).innerHTML = match.Form;
      new_row.insertCell(5).innerHTML = match.Str;
      new_row.insertCell(6).innerHTML = match.Size;
      new_row.insertCell(7).innerHTML = "";
      new_row.insertCell(8).innerHTML = "$" + parseFloat(match.RecSalesPrice).toFixed(2);
      new_row.insertCell(9).innerHTML = "$" + parseFloat(match.RecTotal).toFixed(2);
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[$traceurRuntime.toProperty(i)].id});
      new_row.insertCell(10).innerHTML = myPurch.TotalSavings;
      new_row.cells[10].className = "bold";
      new_row.insertCell(11).innerHTML = match.RecoType;
      new_row.cells[11].className = "bold";
      new_row.insertCell(12).innerHTML = "$" + myPurch.TotalSavings;
      new_row.cells[12].className = "bold";
    }
    ;
  }
});
