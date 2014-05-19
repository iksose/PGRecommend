// SPRINGDALE PHARM

angular.module('uiRouterSample')
.controller('TodoCtrl', function($scope, recoFactory, $window, $rootScope) {

  $scope.myPurchases = {}
  $scope.myPurchases_copy = {};

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
    check_for_illicit_items();

    // sets the "All" dropdown;
    $scope.pagination[3].shade = newArray.length;

  })

  $scope.myRecommendations = {}
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
      new_row.insertCell(0).innerHTML = '<input type="radio" class="hideSuggest" data-rowid='+ myRows[i].id +'> <small>Hide</small>'
      new_row.insertCell(1).innerHTML = "Recommendation";
      new_row.cells[1].className = "Bubba";
      var match = _.findWhere($scope.myRecommendations, {RowID: myRows[i].id});
      new_row.insertCell(2).innerHTML = match.NDC;
      new_row.insertCell(3).innerHTML = match.Descr;
      new_row.insertCell(4).innerHTML = match.MfgName;
      new_row.insertCell(5).innerHTML = match.Form;
      new_row.insertCell(6).innerHTML = match.Str;
      new_row.insertCell(7).innerHTML = match.Size;
      new_row.insertCell(8).innerHTML = "";
      new_row.insertCell(9).innerHTML = "$"+ parseFloat(match.RecSalesPrice).toFixed(2);
      new_row.insertCell(10).innerHTML = "$"+ parseFloat(match.RecTotal).toFixed(2);
      var myPurch = _.findWhere($scope.myPurchases, {RowID: myRows[i].id});
      if(myPurch.checked == true){
        document.getElementById('checkbox' + myRows[i].id).checked = true;
      }
      // row 10 is hidden...see CSS rules.
      new_row.insertCell(11).innerHTML = myPurch.TotalSavings;
      new_row.cells[11].className = "bold";
      // back to regularly scheduled program;
      new_row.insertCell(12).innerHTML = match.RecoType;
      new_row.cells[12].className = "bold";
      new_row.insertCell(13).innerHTML = "$" + parseFloat(myPurch.TotalSavings).toFixed(2);
      new_row.cells[13].className = "bold";

    };

    $scope.applyEvents();

  }

  function check_for_illicit_items(){
    var myBannedItems;
    try{
      myBannedItems = JSON.parse(localStorage["PBA Profitguard"])
    }
    catch(e){
      return;
    }
    // console.log("Available", myBannedItems)
    var acceptableItems = $scope.myPurchases
    var now = Date.parse(new Date())
    for(var i = 0; i < myBannedItems.length; i++){
      // if item has not expired, use filter
      if(Date.parse(myBannedItems[i].storeDate) > now ){
        var terminated_suspects = _.reject(acceptableItems, function(obj){
          return obj.RowID == myBannedItems[i].rowID
        })
          acceptableItems = terminated_suspects;
      }
      else{
          myBannedItems.pop(i)
          // console.log("They've expired")
          // pop the current index, so move back one
          i--
        }
        // end else
        localStorage["PBA Profitguard"] = JSON.stringify(myBannedItems);
        $scope.myPurchases = acceptableItems;
      }
      // console.log("Popped items", bannedItems)
  }


  var bannedItems = [];
  $scope.applyEvents = function(){
    var events = document.getElementsByClassName('hideSuggest')
    for(var i = 0; i < events.length; i++){
      angular.element(events[i]).on('click', function(ev){
        ev.preventDefault();
        return false;
        console.log(ev)
        var element = this.dataset.rowid
        // console.log(element, this)
        var date = new Date();
        var numberOfDaysToAdd = 30;
        date.setDate(date.getDate() + numberOfDaysToAdd);
        var store = {
          storeDate: date.toDateString(),
          rowID: element
        }
        bannedItems.push(store)
        localStorage["PBA Profitguard"] = JSON.stringify(bannedItems);
      })
    }
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

  $scope.selected = 0;

})
