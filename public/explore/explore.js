angular.module('app.explore', [])

.controller('exploreCtrl', ['$scope', 'badgeService', function($scope, badgeService) {
    $scope.badges = badgeService.getAllBadges();
    $scope.test = 'testing123';
    console.log($scope.badges);
}]);