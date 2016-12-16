(function () {
  'use strict';

  describe('Orders Controller Tests', function () {
    // Initialize global variables
    var OrdersController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      OrdersService,
      ProductsService,
      ShopCartService,
      mockProduct,
      mockOrder;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _OrdersService_, _ProductsService_, _ShopCartService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      OrdersService = _OrdersService_;
      ProductsService = _ProductsService_;
      ShopCartService = _ShopCartService_;

      // create mock Order
      mockOrder = new OrdersService({
        _id: '525a8422f6d0f87f0e407a33',
        docno: '1234',
        docdate: new Date(),
        items: [],
        shipping: {
          postcode: 10220,
          subdistrict: 'คลองถนน',
          province: 'กรุงเทพฯ',
          district: 'สายไหม',
          tel: '0900077580',
          email: 'destinationpainbm@gmail.com'
        },
        amount: 0
      });

      mockProduct = new ProductsService({
        _id: '525a8422f6d0f87f0e407a30',
        name: 'Product Name',
        price: 200
      });


      ShopCartService.cart.add(mockProduct);
      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Orders controller.
      OrdersController = $controller('OrdersController as vm', {
        $scope: $scope,
        orderResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('order as read all : vm.cart.load()', function () {

      beforeEach(function () {
        // Setup Orders
        $scope.vm.order = mockOrder;
      });

      it('should load all cart to order', function () {
        $scope.vm.order.items = $scope.vm.cart.load();
        expect($scope.vm.order.items.length).toEqual(1);
      });

    });

    describe('order as qty : vm.addQty()', function () {

      it('should product add qty', function () {
        $scope.vm.addQty($scope.vm.order.items[0]);

        expect($scope.vm.order.items.length).toEqual(1);
        expect($scope.vm.order.items[0].qty).toEqual(2);
        expect($scope.vm.order.items[0].product.price).toEqual(mockProduct.price);
        expect($scope.vm.order.items[0].amount).toEqual(mockProduct.price * $scope.vm.order.items[0].qty);
      });

    });

    describe('order as qty : vm.delQty()', function () {

      it('should product delete qty', function () {
        $scope.vm.order.items[0].qty = 2;
        $scope.vm.delQty($scope.vm.order.items[0]);

        expect($scope.vm.order.items.length).toEqual(1);
        expect($scope.vm.order.items[0].qty).toEqual(1);
        expect($scope.vm.order.items[0].product.price).toEqual(mockProduct.price);
        expect($scope.vm.order.items[0].amount).toEqual(mockProduct.price * $scope.vm.order.items[0].qty);
      });

    });

    describe('order as sum total all product', function () {

      it('should sum total all product', function () {
        $scope.vm.sumTotal();
        expect($scope.vm.order.amount).toEqual(200);
      });

    });

    describe('vm.save() as create', function () {
      var sampleOrderPostData;

      beforeEach(function () {
        // Create a sample Order object
        sampleOrderPostData = new OrdersService({
          docno: '1234'
        });

        $scope.vm.order = sampleOrderPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (OrdersService) {
        // Set POST response
        $httpBackend.expectPOST('api/orders', sampleOrderPostData).respond(mockOrder);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Order was created
        expect($state.go).toHaveBeenCalledWith('orders.view', {
          orderId: mockOrder._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/orders', sampleOrderPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Order in $scope
        $scope.vm.order = mockOrder;
      });

      it('should update a valid Order', inject(function (OrdersService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/orders\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('orders.view', {
          orderId: mockOrder._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (OrdersService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/orders\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Orders
        $scope.vm.order = mockOrder;
      });

      it('should delete the Order and redirect to Orders', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/orders\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('orders.list');
      });

      it('should should not delete the Order and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });

    afterEach(inject(function (_ShopCartService_) {

      ShopCartService = _ShopCartService_;
      ShopCartService.cart.clear();

    }));

  });
} ());