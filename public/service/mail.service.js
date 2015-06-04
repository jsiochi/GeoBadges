angular.module('app.service').
    factory('mailService', mailService);

mailService.$inject = ['$http'];

function mailService($http) {
    return {
        mailInfo: mailInfo
    }
    
    function mailInfo(name, address) {
        return $http.post('/app/mailto', {
            name: name,
            address: address
        });
    };
}