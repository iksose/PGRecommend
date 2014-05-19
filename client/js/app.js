var app = angular.module('uiRouterSample', [
'angular-table'
])

.run(
  [          '$rootScope',
    function ($rootScope) {
    $rootScope.psCustID  = 1
    // $rootScope.psCustID  = document.getElementsByClassName("dvCustId")
    $rootScope.filters = {};
    }
  ]
)
