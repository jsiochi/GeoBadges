angular.module('app.create')
    .controller('BadgeController', BadgeController);

BadgeController.$inject = ['$modalInstance', '$scope'];

function BadgeController($modalInstance, $scope) {
    $scope.close = function () {
        $modalInstance.dismiss('dismiss');
    };
}