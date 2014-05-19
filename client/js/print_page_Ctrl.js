angular.module('uiRouterSample')
.controller('print_page_Ctrl', function($scope, recoFactory, $window) {
  console.log("Welcome to the print Controller")


$scope.myPurchases = {}

$scope.printText = sessionStorage.printText;

  var newArray = [];
  var purchases = JSON.parse(sessionStorage.purchases);
  purchases.forEach(function(obj, index){
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


  $scope.myRecommendations = {}
  var newArray = [];
  var recommendations = JSON.parse(sessionStorage.recommendations);
  recommendations.forEach(function(obj, index){
    if(obj.RecoType == "Endorsed Wholesaler Contract to PBA"){
      obj.RecoType = "PBA Health"
    }
    else if(obj.RecoType == "1Endorsed Wholesaler Non-Contract to Endorsed Wholesaler Contract" || "1Endorsed Wholesaler Contract to PBA"){
      obj.RecoType = "Primary Wholesaler"
    }
    newArray.push(obj)
  })
  $scope.myRecommendations = newArray;
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
  // var available = $scope.tableConfig.itemsPerPage
  var available = purchases.length;
  var myTable = document.getElementById("queryTable");
  var myRows = document.getElementsByClassName("mainRows");
  for (var i = 0; i < available; i++) {
    var new_row = myTable.insertRow( myRows[i].rowIndex + 1);
    new_row.id = "row"+i;
    new_row.insertCell(0).innerHTML = "Recommend";
    new_row.cells[0].className = "Bubba";
    var match = _.findWhere(recommendations, {RowID: myRows[i].id});
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



})
