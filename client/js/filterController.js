angular.module('uiRouterSample')
.controller('filters', function($scope, $filter, $window, $rootScope) {
  $scope.filters = {};

  //AKA "ENDORSED"
  $scope.filters["Primary Wholesaler"] = {
    enabled: false,
    text: [
      "Endorsed Wholesaler Contract to PBA",
      "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract",
      "Endorsed Wholesaler Contract to Endorsed Wholesaler Contract",
      "Endorsed Wholesaler Non-Contract to PBA"
      ]
    }
    $scope.filters["From PBA"] = {
      enabled: false,
      text: [
        "PBA to Endorsed Wholesaler Contract"
        ]
      }
    // AKA "REBATED"
    $scope.filters["Source"] = {
      enabled: false,
      text:[
      "Endorsed Wholesaler Contract to PBA",
      "Endorsed Wholesaler Contract to Endorsed Wholesaler Contract",
      "PBA to Endorsed Wholesaler Contract"
      ]
    }

    $scope.filters["Non Contract"] = {
      enabled: false,
      text: [
      "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract",
      "Endorsed Wholesaler Non-Contract to PBA",
      ]
    }


  $scope.filterClick = function(string, event){
    var filter = string;
    var element = document.getElementById(event.target.id);
    if($scope.filters[filter].enabled == true){
      $scope.filters[filter].enabled = false;
      element.className = event.target.id
    }
    else{
      $scope.filters[filter].enabled = true
      element.className += " " + event.target.id+"Red"
    }
    $scope.ammend();
  }

  $scope.ammend = function(){
    var allMatches = [];

    var jesus = [];

    var do_any_of_my_objects_have_a_true_filter = false;

    for(var key in $scope.filters){
        if($scope.filters[key].enabled){
          do_any_of_my_objects_have_a_true_filter = true;
          console.log("Filter for", key, "is true, do this")
          var firstRun = true;
          var rejectedArray = jesus.length > 0 ? jesus : [];
          var firstRunMaster = jesus.length > 0 ? jesus : $scope.$parent.myPurchases_copy;
          console.log("Value of jesus on second pass", rejectedArray.length)
          for(var i = 0; i < $scope.filters[key].text.length; i++){
            // if not first runthrough, continue filter on the prev. filtered list
            if(!firstRun){
              console.log("On second run...", i)
              var without = _.reject(rejectedArray, function(obj){
                return obj.RecoType == $scope.filters[key].text[i]
              });
              rejectedArray = without
            }
            // if first run, filter on master record
            if(firstRun){
              console.log("On first run...", i)
              console.log(firstRunMaster.length)
              var without = _.reject(firstRunMaster, function(obj){
                return obj.RecoType == $scope.filters[key].text[i]
              });
              rejectedArray = without;
              var firstRun = false;
            }
          }
          // now it's done with first filter/key, save list for next filter/key
          var jesus = rejectedArray;
          console.log("Done with first filter for", key, jesus)
          $scope.$parent.myPurchases = rejectedArray;
        }
    }


    if(!do_any_of_my_objects_have_a_true_filter){
      console.log("No filters...")
      $scope.$parent.myPurchases = $scope.$parent.myPurchases_copy;
    }
    $scope.$parent.destroy();
    setTimeout(function(){$scope.$parent.ammendment()}, 100);
  }

})
