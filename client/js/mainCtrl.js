// SPRINGDALE PHARM

angular.module('uiRouterSample')
.controller('TodoCtrl', function($scope, recoFactory, $window, $rootScope) {

  $scope.myPurchases = []
  $scope.myPurchases_copy = {};
  $scope.selected = 0;

  // $scope.switchStatus = true;
  //
  // $scope.switchStatus2 = true;
  //
  // $scope.switchStatus3 = true;

  recoFactory.getPurchases().then(function(data){
    var newArray = [];
    data.data.aaData.forEach(function(obj, index){
      obj.TotalSavings = parseFloat(parseFloat(obj.TotalSavings).toFixed(2) );
      if(obj.RecoType == "PBA to Endorsed Wholesaler Contract"){
        obj.RecoType_small = "PBA Health"
      }
      else if(obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA"){
        obj.RecoType_small = "Primary Wholesaler"
      }
      obj.SalesPrice = parseFloat(obj.SalesPrice).toFixed(2);
      obj.Total = parseFloat(obj.Total).toFixed(2);
      newArray.push(obj)
    })

    $scope.myPurchases = newArray;
    $scope.myPurchases_copy = newArray;

    if($scope.myRecommendations.length > 0){
      $scope.blender
    }

    // sets the "All" dropdown;
    $scope.pagination[3].shade = newArray.length;

  })

  $scope.myRecommendations = [];
  recoFactory.getRecommendations().then(function(data){
    var newArray = [];
    data.data.aaData.forEach(function(obj, index){
      if(obj.RecoType == "Endorsed Wholesaler Contract to PBA"){
        obj.RecoType = "PBA Health"
      }
      else if(obj.RecoType == "Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "Endorsed Wholesaler Contract to PBA"){
        obj.RecoType = "Primary Wholesaler"
      }
      else if(obj.RecoType == "PBA to Endorsed Wholesaler Contract"){
        obj.RecoType = "Primary Wholesaler"
      }
      newArray.push(obj)
    })
    $scope.myRecommendations = newArray;
    $scope.ammendment();
    // setTimeout(function(){$scope.blender()}, 500);
    $scope.blender();
  })


  $scope.selectChanged = function(dur){
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
    //if they're not populated dude....don't do anything.
    if($scope.myPurchases.length == 0 || $scope.myRecommendations == 0){
      setTimeout(function(){$scope.ammendment()}, 1000);
      return;
    }
    var available = $scope.tableConfig.itemsPerPage
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("mainRows");
    for (var i = 0; i < available; i++) {
      var new_row = myTable.insertRow( myRows[i].rowIndex + 1);
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
      new_row.id = "row"+i;
      new_row.className = "subRow";
      // new_row.insertCell(0).innerHTML = '<input type="radio" class="hideSuggest" data-rowid='+ myRows[i].id +'> <small>Hide</small>'
      var recommendation_row = new_row.insertCell(0);
      recommendation_row.colSpan = 11;
      recommendation_row.innerHTML = '<p class="printBoxes smaller" ><input type="checkbox" data-rowid="'+myPurch.RowID+'" id="checkbox'+myPurch.RowID+'"> Print? </p>' +
        "<p class='recSupply'>Recommendation: " + match.NDC + "</p> " + "<p>MFG: " + " " +
        match.MfgName + "</p> " + "<p class='smaller'>Size: " +  match.Size + "</p> " +
        " " + "<p class='smaller'>Price: " + " " + "$" + match.RecSalesPrice + "</p> " +
        "<p class='recSupply'>Supplier: " + " " + match.RecoType + "</p> "
        // "<p class='teal'><strong>Total Savings: " + "$" + parseFloat(myPurch.TotalSavings).toFixed(2); + "</p></strong>"
      new_row.cells[0].className = "Bubba";

      if(myPurch.checked == true){
        document.getElementById('checkbox' + myRows[i].id).checked = true;
      }

    };
    $scope.applyEvents();


  }


  $scope.applyEvents = function(){
    var available = $scope.tableConfig.itemsPerPage
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("printBoxes");
    for(var i = 0; i < myRows.length; i++){
      angular.element(myRows[i]).on('click', function(ev){
        var checkbox = document.getElementById(ev.target.id);
        var rowid = ev.target.dataset.rowid;
        if(checkbox.checked){
          var match = _.findWhere($scope.myPurchases, {RowID: rowid});
          match.checked = checkbox.checked;
          $scope.$apply(function() {
            $scope.selected++;
          });
        }
        else{
          var match = _.findWhere($scope.myPurchases, {RowID: rowid});
          match.checked = checkbox.checked;
          $scope.$apply(function() {
            $scope.selected--;
          });
        }
      })
    }
  }

  $scope.printAll = function(){
    var childWindow = $window;
    childWindow.sessionStorage.purchases = angular.toJson($scope.myPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations)
    childWindow.sessionStorage.printText = "Showing All"
    childWindow.open('/views/printAll.html')
  }

  // $scope.selected = 0
  $scope.printSelected = function(){
    var childWindow = $window;
    var selectedPurchases = _.where($scope.myPurchases, {checked:true})
    childWindow.sessionStorage.purchases = angular.toJson(selectedPurchases);
    childWindow.sessionStorage.recommendations = angular.toJson($scope.myRecommendations)
    childWindow.sessionStorage.printText = "Showing " + selectedPurchases.length + " of " + $scope.pagination[3].shade;
    childWindow.open('/views/printAll.html')
  }


  // for the bottom print part
  // we'll just marry all the data
  // honestly we could just do this at the beginning
  $scope.blender = function(){
    //if they're not populated dude....don't do anything.
    if($scope.myPurchases.length == 0 || $scope.myRecommendations == 0){
      setTimeout(function(){$scope.blender()}, 1000);
      return;
    }
    for(var i = 0; i < $scope.myPurchases.length; i++){
      var match = _.findWhere($scope.myRecommendations, {RowID: $scope.myPurchases[i].RowID});
      match.UnitPrice = ( parseFloat(match.RecSalesPrice) / parseFloat(match.Size ) ).toFixed(2)
      match.RecSalesPrice = parseFloat(match.RecSalesPrice).toFixed(2)
      $scope.myPurchases[i].Reco = match;
      $scope.myPurchases[i].TotalSavings_string = parseFloat($scope.myPurchases[i].TotalSavings).toFixed(2)
      $scope.myPurchases[i].UnitPrice = ( parseInt($scope.myPurchases[i].SalesPrice) / parseInt($scope.myPurchases[i].Size ) ).toFixed(2)
      // console.log(  $scope.myPurchases[i].Reco)
    }
  }

  $scope.removePrint = function(ev){
    $scope.selected--;
    var match = _.findWhere($scope.myPurchases, {RowID: ev.target.id});
    match.checked = false;
    var checkbox = document.getElementById("checkbox"+ev.target.id);
    checkbox.checked = false;
    // $scope.$apply(function() {
    //   $scope.selected--;
    // });z
  }



   $scope.destroy = function(amount){
    var myTable = document.getElementById("queryTable");
    var myRows = document.getElementsByClassName("subRow");
    // start at 1 because 0 is tablehead,
    // <= because we need the last one,
    // and i + 1 because we're removing the child cell;
    for(var i = 0; i < myRows.length; i ++){
      myRows[i].remove();
      i--;
    }
  }


  $scope.showStatus = "Collapse"
  $scope.showValue = 1;
  $scope.magic = function(){
    // console.log("Got here", $scope.showValue)
    if($scope.showValue == 0){
      //show full view
      $scope.showStatus = "Collapse"
      $scope.showValue = 1;
      $scope.destroy();
      $scope.ammendment();
      var myTable = document.getElementById("queryTable");
      var myRows = document.getElementsByClassName("mainRows");
      for(var i = 0; i < myRows.length; i++){
        var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
        var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
        myRows[i].cells[0].innerHTML = myPurch.NDC
      }
    }
    else{
      //show collapsed view
      $scope.showStatus = "Expand"
      $scope.showValue = 0;
      $scope.destroy();
      //now add buttons
      var myTable = document.getElementById("queryTable");
      var myRows = document.getElementsByClassName("mainRows");
      for(var i = 0; i < myRows.length; i++){
        var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
        // console.log(match.Descr)
        var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
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
    }
  }

  $scope.miniAmmend = function(rowid, match){
    // console.log("Mini ammend?", rowid)
    var myTable = document.getElementById("queryTable");
    var row = document.getElementById(rowid);
    var myPurch = _.findWhere($scope.myPurchases, {RowID: rowid});
    // console.log(row)
    var new_row = myTable.insertRow( row.rowIndex + 1);
    // var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
    // var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
    new_row.id = "row";
    new_row.className = "subRow";
    // new_row.insertCell(0).innerHTML = '<input type="radio" class="hideSuggest" data-rowid='+ myRows[i].id +'> <small>Hide</small>'
    var recommendation_row = new_row.insertCell(0);
    recommendation_row.colSpan = 11;
    // recommendation_row.innerHTML = "Hello"
    recommendation_row.innerHTML = '<p class="printBoxes smaller" ><input type="checkbox" data-rowid="'+myPurch.RowID+'" id="checkbox'+myPurch.RowID+'"> Print? </p>' +
      "<p class='recSupply'>Recommendation: " + match.NDC + "</p> " + "<p>MFG: " + " " +
      match.MfgName + "</p> " + "<p class='smaller'>Size: " +  match.Size + "</p> " +
      " " + "<p class='smaller'>Price: " + " " + "$" + match.RecSalesPrice + "</p> " +
      "<p class='recSupply'>Supplier: " + " " + match.RecoType + "</p> "
      if(myPurch.checked == true){
        document.getElementById('checkbox' + rowid).checked = true;
      }
      $scope.applyEvents();
    }



})
