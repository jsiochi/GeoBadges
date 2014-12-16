angular.module('app.service', [])

.factory('badgeService', ['$http', function($http) {
    function getAllBadges() {
        return "Badges";
    }
    
    return {
        getAllBadges: getAllBadges
    };
}]);