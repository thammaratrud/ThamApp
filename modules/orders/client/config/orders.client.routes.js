(function () {
  'use strict';

  angular
    .module('orders')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('me', {
        url: '/me',
        templateUrl: 'modules/orders/client/views/me.client.view.html',
        controller: 'MeController',
        controllerAs: 'vm'
      })
      .state('complete', {
        url: '/:orderId/complete',
        templateUrl: 'modules/orders/client/views/complete.client.view.html',
        controller: 'CompleteController',
        controllerAs: 'vm',
        resolve: {
          orderResolve: getOrder
        }
      })
      .state('checkout-create', {
        url: '/checkout-create',
        templateUrl: 'modules/orders/client/views/checkout-create.client.view.html',
        controller: 'CheckoutCreateController',
        controllerAs: 'vm'
      })
      .state('checkout-login', {
        url: '/checkout-login',
        templateUrl: 'modules/orders/client/views/checkout-login.client.view.html',
        controller: 'CheckoutLoginController',
        controllerAs: 'vm',
        resolve: {
          orderResolve: newOrder
        }
      })
      .state('cartview', {
        url: '/cartview',
        templateUrl: 'modules/orders/client/views/cartview.client.view.html',
        controller: 'CartviewController',
        controllerAs: 'vm'
      })
      .state('orders', {
        abstract: true,
        url: '/orders',
        template: '<ui-view/>'
      })
      .state('orders.list', {
        url: '',
        templateUrl: 'modules/orders/client/views/list-orders.client.view.html',
        controller: 'OrdersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Orders List'
        }
      })
      .state('orders.create', {
        url: '/create',
        templateUrl: 'modules/orders/client/views/form-order.client.view.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
        resolve: {
          orderResolve: newOrder
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Orders Create'
        }
      })
      .state('orders.edit', {
        url: '/:orderId/edit',
        templateUrl: 'modules/orders/client/views/form-order.client.view.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
        resolve: {
          orderResolve: getOrder
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Order {{ orderResolve.name }}'
        }
      })
      .state('orders.view', {
        url: '/:orderId',
        templateUrl: 'modules/orders/client/views/view-order.client.view.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
        resolve: {
          orderResolve: getOrder
        },
        data: {
          pageTitle: 'Order {{ orderResolve.name }}'
        }
      });
  }

  getOrder.$inject = ['$stateParams', 'OrdersService'];

  function getOrder($stateParams, OrdersService) {
    return OrdersService.get({
      orderId: $stateParams.orderId
    }).$promise;
  }

  newOrder.$inject = ['OrdersService'];

  function newOrder(OrdersService) {
    return new OrdersService();
  }
} ());
