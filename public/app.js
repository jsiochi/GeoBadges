angular.module('app.explore', []);
angular.module('app.service', []);
angular.module('app.create', []);

angular.module('app', [
    'app.service', 
    'app.explore',
    'app.create',
    'ui.router',
    'ui.bootstrap',
    'ngTagsInput'
])
.config(function($stateProvider, $urlRouterProvider) {
//    $urlRouterProvider.otherwise('');
    
    $stateProvider.state('splash', {
        url: '',
        templateUrl: 'splash/splash.html'
    })
    .state('create', {
        url: '/create',
        templateUrl: 'create/create.html'
    })
    .state('create.detail', {
        url: '/:pathway_id',
        templateUrl: 'create/create.html'
    })
    .state('explore', {
        url: '/explore',
        templateUrl: 'explore/explore.html'
    });
});