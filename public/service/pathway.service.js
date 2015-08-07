angular.module('app.service').
    factory('pathwayService', pathwayService);

pathwayService.$inject = ['$http'];

function pathwayService($http) {
    return {
        getAllPathways: getAllPathways,
        getPathway: getPathway,
        getFeaturedPathways: getFeaturedPathways,
        makePathway: makePathway,
        savePathway: savePathway,
        queryPathways: queryPathways,
        deletePathway: deletePathway
    }
    
    function getAllPathways() {
        return $http.get('/api/pathways/');
    }
    
    function getPathway(pathwayId) {
        return $http.get('/api/pathway/' + pathwayId);
    }
    
    function getFeaturedPathways() {
        return $http.get('/api/pathways/featured');
    }
    
    function makePathway(content) {
        return $http.post('/api/pathways/', content);
    }
    
    function savePathway(pathwayId, content) {
        return $http.put('/api/pathway/' + pathwayId, content);
    }
    
    function queryPathways(query) {
        return $http.post('/api/pathways/find', query);
    }
    
    function deletePathway(pathwayId) {
        return $http.delete('/api/pathway/' + pathwayId);
    }
}