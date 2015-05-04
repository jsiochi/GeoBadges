angular.module('app.service').
    factory('badgeService', badgeService);

badgeService.$inject = ['$http'];

function badgeService($http) {
    return {
        createBadge: createBadge,
        getBadge: getBadge,
        getAllBadges: getAllBadges,
        updateBadge: updateBadge,
        getBadgeBuilder: getBadgeBuilder
    }
    
    function createBadge(content) {
        console.log(content);
        return $http.post('/api/credlybadge/', content, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }            
        });
    }
    
    function getBadge(badgeId) {
        return $http.get('/api/credlybadge/' + badgeId);
    }
    
    function updateBadge(badgeId, content) {
        return $http.put('/api/credlybadge/' + badgeId, content, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }            
        });
    }
    
    function getBadgeBuilder() {
        return $http.get('/api/credlybadgebuilder');
    }
    
    function getAllBadges() {
        
    }
}