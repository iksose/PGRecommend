angular.module('uiRouterSample')
.controller('filters', function($scope, $filter, $window, $rootScope) {
  $scope.filters = {};

  $scope.test = function(event){
    var filter = event.target.id;
    var something = document.getElementById(filter);
    if($scope.filters[filter]){
      delete $scope.filters[filter]
      something.innerText = "Off"
    }
    else{
      $scope.filters[filter] = true;
      something.innerText = "On"
    }
    $scope.ammend();
  }

  $scope.ammend = function(){
    var allMatches = [];
    for(var key in $scope.filters){
      var match = _.where($scope.$parent.myPurchases_copy, {MfgName: key})
      allMatches = allMatches.concat(match)
    }
    $scope.$parent.myPurchases = allMatches;
    if(Object.keys($scope.filters).length == 0){
      $scope.$parent.myPurchases = $scope.$parent.myPurchases_copy;
    }
    $scope.$parent.destroy();
    setTimeout(function(){$scope.$parent.ammendment()}, 100);
  }

})
