angular.module('uiRouterSample')
.factory('recoFactory',
 function ($http, $rootScope) {
  var psCustID = $rootScope.psCustID
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