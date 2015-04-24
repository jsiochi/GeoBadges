angular.module('app.service').
    factory('pathwayService', pathwayService);

pathwayService.$inject = ['$http'];

function pathwayService($http) {
    return {
        getAllPathways: getAllPathways,
        getPathway: getPathway,
        makePathway: makePathway,
        savePathway: savePathway
    }
    
    function getAllPathways() {
        return $http.get('/api/pathways/');
    }
    
    function getPathway(pathwayId) {
        return $http.get('/api/pathway/' + pathwayId);
    }
    
    function makePathway(content) {
        return $http.post('/api/pathways/', content);
    }
    
    function savePathway(pathwayId, content) {
        return $http.put('/api/pathway/' + pathwayId, content);
    }
}