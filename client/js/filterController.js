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
    //because we're supporting two views
    if($scope.showValue == 0){
      console.log("compact view sort")
      $scope.destroy();
      var myTable = document.getElementById("queryTable");
      var myRows = document.getElementsByClassName("mainRows");
      for(var i = 0; i < myRows.length; i++){
        var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
        var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
        myRows[i].cells[0].innerHTML = myPurch.NDC
      }
      var myRows = "";
    }
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
          var firstRun = true;
          var rejectedArray = jesus.length > 0 ? jesus : [];
          var firstRunMaster = jesus.length > 0 ? jesus : $scope.$parent.myPurchases_copy;
          for(var i = 0; i < $scope.filters[key].text.length; i++){
            // if not first runthrough, continue filter on the prev. filtered list
            if(!firstRun){
              var without = _.reject(rejectedArray, function(obj){
                return obj.RecoType == $scope.filters[key].text[i]
              });
              rejectedArray = without
            }
            // if first run, filter on master record
            if(firstRun){
              var without = _.reject(firstRunMaster, function(obj){
                return obj.RecoType == $scope.filters[key].text[i]
              });
              rejectedArray = without;
              var firstRun = false;
            }
          }
          // now it's done with first filter/key, save list for next filter/key
          var jesus = rejectedArray;
          $scope.$parent.myPurchases = rejectedArray;
        }
    }


    if(!do_any_of_my_objects_have_a_true_filter){
      $scope.$parent.myPurchases = $scope.$parent.myPurchases_copy;
    }

    // $scope.$parent.destroy();
    // setTimeout(function(){$scope.$parent.ammendment()}, 100);

    // we're supporting multiple views now...
    // so which redraw depoends on what the user has selected

      if($scope.showValue == 1){
        // 1 = expanded view...default
        // console.log("Default view sort")
        $scope.$parent.destroy();
        setTimeout(function(){$scope.$parent.ammendment()}, 100);
      } else if($scope.showValue == 0){
        //has an old reference to myRows rows
        setTimeout(function(){
        // console.log("compact view sort")
        // $scope.destroy();
        //now add buttons
        var myRows = [];

        var myTable = document.getElementById("queryTable");
        var myRows = document.getElementsByClassName("mainRows");
        for(var i = 0; i < myRows.length; i++){
          var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
          // console.log(match.Descr)
          var myPurch = _.findWhere($scope.$parent.myPurchases_copy, {RowID: myRows[i].id});
          // alert("Got here", myPurch)
          // console.log(myRows[i])
          // console.log("Got here", myRows[i].id, myPurch)
          myRows[i].cells[0].innerHTML = myPurch.NDC + "<button class='btn btn-info btn-sm' id='b"+match.RowID+"'>Recommendations</button>"
          myRows[i].cells[0].id = match.RowID;
          angular.element(myRows[i].cells[0]).on('click', function(ev){
            var theID = ev.target.id.substring(1)
            // console.log("Gotcha fucker", theID)
            var match = _.findWhere($scope.myRecommendations, {RowID: theID});
            // console.log(match)
            // console.log(myRows[i])
            var subRows = document.getElementsByClassName('subRow')
            for(var i = 0; i < subRows.length; i++)
            {
              subRows[i].remove();
            }
            $scope.miniAmmend(theID, match);
          })
        }
      }, 100);
      }
  }

})
