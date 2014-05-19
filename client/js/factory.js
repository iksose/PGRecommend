angular.module('uiRouterSample')
.factory('recoFactory',
 function ($http, $rootScope) {
  // var psCustID = $rootScope.psCustID
  var psCustID = document.getElementsByClassName("dvCustId")[0].innerText;
    return {
        getPurchases:function(url){
          return $http.get('/_vti_bin/ProfitguardRecommendationsWCF.svc/GetPurchases/' + psCustID)
        },
        getRecommendations:function(url){
          return $http.get('/_vti_bin/ProfitguardRecommendationsWCF.svc/GetRecommendations/' + psCustID)
        }
    };
  }
);
