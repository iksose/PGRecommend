// SPRINGDALE PHARM

angular.module('uiRouterSample')
.controller('TodoCtrl', function($scope, recoFactory, $window, $rootScope) {
  console.log("Welcome to the Admin Controller")
  //$scope.tableConfig.currentPage = 0;

  $scope.myPurchases = {}
  $scope.myPurchases_copy = {};

  $scope.filters = $rootScope.filters

  recoFactory.getPurchases().then(function(data){
    var newArray = [];
    data.data.aaData.forEach(function(obj, index){
      obj.TotalSavings = parseFloat(parseFloat(obj.TotalSavings).toFixed(2) );
      if(obj.RecoType == "PBA to Endorsed Wholesaler Contract"){
        obj.RecoType = "PBA Health"
      }
      else if(obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA"){
        obj.RecoType = "Primary Wholesaler"
      }
      newArray.push(obj)
    })

    $scope.myPurchases = newArray;
    $scope.myPurchases_copy = newArray;

    // sets the "All" dropdown;
    $scope.pagination[3].shade = newArray.length;

  })

  $scope.myRecommendations = {}
  recoFactory.getRecommendations().then(function(data){
    console.log("Recos", data.data.aaData)
    var newArray = [];
    data.data.aaData.forEach(function(obj, index){
      if(obj.RecoType == "Endorsed Wholesaler Contract to PBA"){
        obj.RecoType = "PBA Health"
      }
      else if(obj.RecoType == "1Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "1Endorsed Wholesaler Contract to PBA"){
        obj.RecoType = "Primary Wholesaler"
      }
      newArray.push(obj)
    })
    $scope.myRecommendations = newArray;
    $scope.ammendment();
  })


  $scope.selectChanged = function(dur){
    console.log("select changed", $scope.tableConfig.itemsPerPage, " old ", dur.shade, " new")
    $scope.tableConfig.oldAmount = $scope.tableConfig.itemsPerPage
    $scope.tableConfig.itemsPerPage = dur.shade
    $scope.destroy();
    setTimeout(function(){$scope.ammendment()}, 100);
  }

  $scope.pagination = [
    {name: 5, shade: 5},
    {name: 10, shade:10},
    {name:20, shade: 20},
    {name: "All", shade: 3}
  ];


  $scope.myPagination = $scope.pagination[0];
  $scope.tableConfig = {
    itemsPerPage: $scope.myPagination.shade,
    fillLastPage: false,
    maxPages: 10,
    oldAmount: $scope.myPagination.shade
  }

  $scope.tableConfig.currentPage = 1;
  $scope.$watch('tableConfig.currentPage', function(newVal, oldVal) {
    if(newVal !== oldVal){
      $scope.destroy($scope.tableConfig.itemsPerPage);
      setTimeout(function(){$scope.ammendment()}, 100);
    }
   });


  $scope.ammendment = function(){
    var available = $scope.tableConfig.itemsPerPage
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 0; i < available; i++) {
      var new_row = myTable.insertRow( myRows[i].rowIndex + 1);
      new_row.id = "row"+i;
      new_row.insertCell(0).innerHTML = "Recommendation";
      new_row.cells[0].className = "Bubba";
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
      console.log("MATCH?", match)
      new_row.insertCell(1).innerHTML = match.NDC;
      new_row.insertCell(2).innerHTML = match.Descr;
      new_row.insertCell(3).innerHTML = match.MfgName;
      new_row.insertCell(4).innerHTML = match.Form;
      new_row.insertCell(5).innerHTML = match.Str;
      new_row.insertCell(6).innerHTML = match.Size;
      new_row.insertCell(7).innerHTML = "";
      new_row.insertCell(8).innerHTML = "$"+ parseFloat(match.RecSalesPrice).toFixed(2);
      new_row.insertCell(9).innerHTML = "$"+ parseFloat(match.RecTotal).toFixed(2);
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
      if(myPurch.checked == true){
        document.getElementById('checkbox' + myRows[i].id).checked = true;
      }
      // row 10 is hidden...see CSS rules.
      new_row.insertCell(10).innerHTML = myPurch.TotalSavings;
      new_row.cells[10].className = "bold";
      // back to regularly scheduled program;
      new_row.insertCell(11).innerHTML = match.RecoType;
      new_row.cells[11].className = "bold";
      new_row.insertCell(12).innerHTML = "$" + myPurch.TotalSavings;
      new_row.cells[12].className = "bold";

    };

  }

   $scope.destroy = function(amount){
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    // start at 1 because 0 is tablehead,
    // <= because we need the last one,
    // and i + 1 because we're removing the child cell;
    for(var i = 1; i <= myRows.length; i ++){
      myTable.rows[i+1].remove();
    }
  }



  // var bool = true;
  // $scope.collapse = function(){
  //
  //   if(bool){
  //     $scope.destroy();
  //     bool = false;
  //   }
  //   else if(!bool){
  //     $scope.ammendment();
  //     bool = true;
  //   }
  // }


  $scope.selected = 0;

})
