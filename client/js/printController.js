angular.module('uiRouterSample')
.controller('printCtrl2', function($scope, $filter, $window, $rootScope) {
  $scope.addPrint = function(rowTargID, $event){
    // $event.preventDefault();
    if($event.target.type == "checkbox"){
      var match = _.findWhere($scope.myPurchases, {RowID: rowTargID});
      match.checked = document.getElementById('checkbox' + rowTargID).checked;
      if(match.checked)
      $scope.selected++;
      else
      $scope.selected--;
      return;
    }
    if(document.getElementById('checkbox' + rowTargID).checked){
      document.getElementById('checkbox' + rowTargID).checked = false
      var match = _.findWhere($scope.myPurchases, {RowID: rowTargID});
      match.checked = false;
      $scope.selected--;
    }
    else{
      document.getElementById('checkbox' + rowTargID).checked = true;
      var match = _.findWhere($scope.myPurchases, {RowID: rowTargID});
      match.checked = true;
      $scope.selected++;
    }
  }

  $scope.printAll = function(){
    var childWindow = $window;
    childWindow.sessionStorage.purchases = angular.toJson($scope.myPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations)
    childWindow.sessionStorage.printText = "Showing All"
    childWindow.open('/views/printAll.html')
  }

  $scope.selected = 0
  $scope.printSelected = function(){
    var childWindow = $window;
    var selectedPurchases = _.where($scope.myPurchases, {checked:true})
    childWindow.sessionStorage.purchases = angular.toJson(selectedPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations)
    childWindow.sessionStorage.printText = "Showing " + selectedPurchases.length + " of " + $scope.pagination[3].shade;
    childWindow.open('/views/printAll.html')
  }
})
