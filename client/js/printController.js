angular.module('uiRouterSample')
.controller('printCtrl2', function($scope, $filter, $window, $rootScope) {
  console.log("Welcome to print 2")
  $scope.addPrint = function(arg, $event){
    // $event.preventDefault();
    if($event.target.type == "checkbox"){
      var match = _.findWhere($scope.myPurchases, {RowID: arg});
      match.checked = document.getElementById('checkbox' + arg).checked;
      if(match.checked)
      $scope.selected++;
      else
      $scope.selected--;
      return;
    }
    if(document.getElementById('checkbox' + arg).checked){
      document.getElementById('checkbox' + arg).checked = false
      var match = _.findWhere($scope.myPurchases, {RowID: arg});
      match.checked = false;
      $scope.selected--;
    }
    else{
      document.getElementById('checkbox' + arg).checked = true;
      var match = _.findWhere($scope.myPurchases, {RowID: arg});
      match.checked = true;
      $scope.selected++;
    }
  }

  $scope.printAll = function(){
    console.log("Print all?")
    var childWindow = $window;
    childWindow.sessionStorage.purchases = angular.toJson($scope.myPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations)
    childWindow.sessionStorage.printText = "Showing All"
    childWindow.open('/views/printAll.html')
  }

  $scope.selected = 0
  $scope.printSelected = function(){
    console.log("Print selected?")
    var childWindow = $window;
    var selectedPurchases = _.where($scope.myPurchases, {checked:true})
    childWindow.sessionStorage.purchases = angular.toJson(selectedPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations)
    childWindow.sessionStorage.printText = "Showing " + selectedPurchases.length + " of " + $scope.colors[3].shade;
    childWindow.open('/views/printAll.html')
  }
})
