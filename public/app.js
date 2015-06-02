angular.module('app.explore', []);
angular.module('app.service', []);
angular.module('app.create', []);

angular.module('app', [
    'app.service', 
    'app.explore',
    'app.create',
    'ui.router',
    'ui.bootstrap',
    'ngTagsInput',
    'ngSanitize'
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
    })
    .state('pathway', {
        url: '/pathway/:pathway_id',
        templateUrl: 'pathway/pathway.html'
    })
    .state('about', {
        url: '/about',
        templateUrl: 'about/about.html'
    })
    .state('contribute', {
        url: '/contribute',
        templateUrl: 'contribute/contribute.html'
    });
});