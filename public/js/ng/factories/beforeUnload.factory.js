"use strict"

lab.factory('beforeUnload', function ($rootScope, $window, $location) {
    
    $window.onbeforeunload = function (e) {
        let confirmation = {};
        let event = $rootScope.$broadcast('onBeforeUnload', confirmation);
        if (event.defaultPrevented) {
            return confirmation.message;
        }
    };
    
    $window.onunload = function () {
    	
    	$rootScope.$broadcast('onUnload');
    };

    return {};
});
