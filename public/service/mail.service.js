angular.module('app.service').
    factory('mailService', mailService);

mailService.$inject = ['$http'];

function mailService($http) {
    return {
        mailInfo: mailInfo,
        mailAnyMessage: mailAnyMessage
    }
    
    function mailInfo(name, address) {
        return $http.post('/app/mailto', {
            name: name,
            address: address
        });
    };
    
    function mailAnyMessage(address, subject, text) {
        return $http.post('/app/mailmsg', {
            address: address,
            subject: subject,
            text: text
        });
    };
}