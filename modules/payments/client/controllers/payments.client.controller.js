(function () {
    'use strict';

    // Payments controller
    angular
        .module('payments')
        .controller('PaymentsController', PaymentsController);

    PaymentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'paymentResolve', 'AccountchartsService'];

    function PaymentsController($scope, $state, $window, Authentication, payment, AccountchartsService) {
        var vm = this;

        vm.authentication = Authentication;
        vm.payment = payment;
        vm.error = null;
        vm.form = {};
        vm.remove = remove;
        vm.save = save;
        vm.setData = setData;
        vm.readClient = readClient;
        vm.readProduct = readProduct;
        vm.selectCustomer = selectCustomer;
        vm.creditdayChanged = creditdayChanged;
        vm.calculate = calculate;
        vm.init = init;
        vm.selectedProduct = selectedProduct;
        vm.selectedProductss = null;
        vm.changeUnitPrice = changeUnitPrice;
        vm.removeProduct = removeProduct;
        vm.selectedDebits = selectedDebits;
        vm.removeDebits = removeDebits;
        vm.selectedCredits = selectedCredits;
        vm.removeCredits = removeCredits;
        vm.caldebits = caldebits;
        vm.calcredits = calcredits;
        vm.payment.totaldebit = vm.payment.totaldebit ? vm.payment.totaldebit : 0;
        vm.payment.totalcredit = vm.payment.totalcredit ? vm.payment.totalcredit : 0;
        vm.getDocno = getDocno;
        vm.searchEdit = searchEdit;

        var dat = new Date();
        Date.prototype.addDays = function (days) {
            var dat = new Date(vm.payment.docdate);
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        function getDocno() {
            var dateNow = new Date();
            var getYear = dateNow.getFullYear();
            var getMonth = dateNow.getMonth() + 1;
            var month = null;
            if (!vm.payment.docno) {
                if (getMonth > 9) {
                    if (vm.payment.gltype !== undefined) {
                        vm.payment.docno = vm.payment.gltype + '' + getYear + '' + getMonth;
                    }
                } else {
                    month = '0' + getMonth.toString();
                    if (vm.payment.gltype !== undefined) {
                        vm.payment.docno = vm.payment.gltype + '' + getYear + '' + month;
                    }
                }
            }
        }

        function creditdayChanged(docdate) {
            vm.payment.drilldate = dat.addDays(vm.payment.creditday);

            // var noMath = (vm.payment.drilldate - vm.payment.docdate) / 86400000;
            // var parse = parseInt((vm.payment.drilldate - vm.payment.docdate) / 86400000);
            // vm.payment.creditday = parse + 1;


        }

        function setData() {

            if (vm.payment.drilldate) {
                vm.payment.docdate = new Date(vm.payment.docdate);
                vm.payment.drilldate = new Date(vm.payment.drilldate);
            } else {
                vm.payment.docdate = vm.payment.docdate ? new Date(vm.payment.docdate) : new Date();
                vm.payment.drilldate = new Date();
            }
            if (!vm.payment.items) {
                vm.payment.items = [{

                }];
            }
            if (!vm.payment.credits) {
                vm.payment.credits = [{

                }];
            }
            if (!vm.payment.debits) {
                vm.payment.debits = [{

                }];
            }

        }

        function readClient() {

            vm.client = AccountchartsService.query();

        }

        function selectCustomer() {
            vm.payment.creditday = vm.payment.client.creditday;
            vm.payment.drilldate = dat.addDays(vm.payment.creditday);
        }


        function readProduct() {

            vm.products = AccountchartsService.query();

        }

        function caldebits(debits) {
            if (debits) {
                vm.debits.amount = debits.amount;
                vm.payment.debits.totalamount = debits.amount + debits.amount;

            }

            vm.payment.totaldebit = 0;

            vm.payment.debits.forEach(function (itm) {

                vm.payment.totaldebit += itm.amount;




            });


        }
        function calcredits(credits) {
            if (credits) {
                vm.credits.amount = credits.amount;
                vm.payment.credits.totalamount = credits.amount + credits.amount;

            }

            vm.payment.totalcredit = 0;

            vm.payment.credits.forEach(function (itm) {

                vm.payment.totalcredit += itm.amount;




            });


        }

        function calculate(item) {
            // item.unitprice = item.product.priceexcludevat;
            // item.qty = 1;
            // if (item) {
            //   item.amount = item.unitprice * item.qty;
            //   item.vatamount = item.amount * 0.07;
            //   if (item.product.category === 'S') {
            //     item.whtamount = item.amount * 0.03;
            //   } else if (item.product.category === 'R') {
            //     item.whtamount = item.amount * 0.05;
            //   } else {
            //     item.whtamount = 0;
            //   }
            //   item.totalamount = (item.amount + item.vatamount) - item.whtamount;
            // }

            // vm.payment.amount = 0;
            // vm.payment.vatamount = 0;
            // vm.payment.whtamount = 0;
            // vm.payment.totalamount = 0;

            // vm.payment.items.forEach(function (itm) {

            //   vm.payment.amount += itm.amount;
            //   vm.payment.vatamount += itm.vatamount;
            //   vm.payment.whtamount += itm.whtamount;
            //   vm.payment.totalamount += itm.totalamount;

            // });

        }

        function changeUnitPrice(item) {
            // item.unitprice = item.product.priceexcludevat;
            // calculate(item);
        }

        function init() {

            vm.setData();
            vm.readClient();
            vm.readProduct();

        }

        function selectedProduct() {
            vm.payment.items.push({

            });
        }

        function removeProduct(index) {
            vm.payment.items.splice(index, 1);
            calculate();
        }

        // credits
        function selectedCredits() {
            vm.payment.credits.push({

            });
        }

        function removeCredits(index) {
            vm.payment.credits.splice(index, 1);
            if (vm.payment.credits.length === 0) {
                vm.payment.totalcredit = 0;
            } else {
                vm.payment.totalcredit = 0;
                vm.payment.credits.forEach(function (itm) {
                    vm.payment.totalcredit += itm.amount;
                });
            }
        }
        // debits
        function selectedDebits() {
            vm.payment.debits.push({

            });
        }
        // vm.payment.debits.totalamount = vm.payment.amount;
        // console.log(vm.payment.debits);

        function removeDebits(index) {
            vm.payment.debits.splice(index, 1);
            if (vm.payment.debits.length === 0) {
                vm.payment.totaldebit = 0;
            } else {
                vm.payment.totaldebit = 0;
                vm.payment.debits.forEach(function (itm) {
                    vm.payment.totaldebit += itm.amount;
                });
            }
        }

        function searchEdit(txtsearch) {
            //PV201703001
            if (txtsearch === 'PV201703001') {
                alert('-= PV201703001 =-');
            } else {
                alert('ค้นหาไม่สำเร็จ\n ไม่มีเลขที่เอกสารนี้');;
            }
        }

        // Remove existing Payment
        function remove() {
            if ($window.confirm('Are you sure you want to delete?')) {
                vm.payment.$remove($state.go('payments.list'));
            }
        }

        // Save Payment
        function save(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.paymentForm');
                return false;
            }
            // TODO: move create/update logic to service
            if (vm.payment._id) {
                vm.payment.$update(successCallback, errorCallback);
            } else {
                vm.payment.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                if (res.gltype === 'PV') {
                    alert('บันทึกข้อมูลสำเร็จ\n เอกสารเลขที่ ' + res.docno);
                    $state.reload();
                } else if (res.gltype === 'AP') {
                    alert('บันทึกข้อมูลสำเร็จ\n เอกสารเลขที่ ' + res.docno);
                    $state.reload();
                } else if (res.gltype === 'AR') {
                    alert('บันทึกข้อมูลสำเร็จ\n เอกสารเลขที่ ' + res.docno);
                    $state.reload();
                } else if (res.gltype === 'RV') {
                    alert('บันทึกข้อมูลสำเร็จ\n เอกสารเลขที่ ' + res.docno);
                    $state.reload();
                } else if (res.gltype === 'JV') {
                    alert('บันทึกข้อมูลสำเร็จ\n เอกสารเลขที่ ' + res.docno);
                    $state.reload();
                }
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }
    }
} ());
