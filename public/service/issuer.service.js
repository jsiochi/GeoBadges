angular.module('app.service').
    factory('issuerService', issuerService);

issuerService.$inject = ['$http'];

function issuerService($http) {
    return {
        getIssuers: getIssuers,
        addIssuer: addIssuer
    }
    
    function getIssuers() {
        return $http.get('/api/issuers/');
    }
    
    function addIssuer(name) {
        return $http.post('/api/issuers/', {name: name});
    }
}