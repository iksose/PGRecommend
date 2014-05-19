angular.module('uiRouterSample')
.controller('print_page_Ctrl', function($scope, $window) {
  console.log("Welcome to the print Controller")

  $scope.printText = sessionStorage.printText;
  $scope.myPurchases = JSON.parse(sessionStorage.purchases);

  $scope.myRecommendations = JSON.parse(sessionStorage.recommendations);;
  setTimeout(function(){ammendment()}, 100);
  setTimeout(function(){window.print()}, 500)


  $scope.colors = [
    {name: 5, shade: 5},
    {name: 10, shade:10},
    {name:20, shade: 20},
    {name: "All", shade: 1000}
  ];
  $scope.myColor = $scope.colors[0];
  $scope.tableConfig = {
    itemsPerPage: 1000,
    fillLastPage: false,
    oldAmount: $scope.myColor.name
  }



  function ammendment(){
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
      // row 10 is hidden...see CSS rules.
      new_row.insertCell(11).innerHTML = myPurch.TotalSavings;
      new_row.cells[11].className = "bold";
      // back to regularly scheduled program;
      new_row.insertCell(12).innerHTML = match.RecoType;
      new_row.cells[12].className = "bold";
      new_row.insertCell(13).innerHTML = "$" + myPurch.TotalSavings;
      new_row.cells[13].className = "bold";

    };
  }



})
