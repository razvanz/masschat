(function () {
	'use strict';

	var toastr = function (toaster) {
		var popWrap = function (type, title, body, bodyType, timeout, clickHndl) {
			if ('function' == typeof bodyType) {
				clickHndl = bodyType;
				bodyType = null;
				timeout = null;
			} else if ('function' == typeof timeout) {
				clickHndl = timeout;
				timeout = null;
			}
			toaster.pop(type, title, body, timeout, bodyType, clickHndl);
		};

		this.info = function (title, body, bodyType, timeout, clickHndl) {
			popWrap('info', title, body, timeout, bodyType, clickHndl);
		};
		this.warn = function (title, body, bodyType, timeout, clickHndl) {
			popWrap('warning', title, body, timeout, bodyType, clickHndl);
		};
		this.err = function (title, body, bodyType, timeout, clickHndl) {
			popWrap('error', title, body, timeout, bodyType, clickHndl);
		};
		this.wait = function (title, body, bodyType, timeout, clickHndl) {
			popWrap('wait', title, body, timeout, bodyType, clickHndl);
		};
		this.success = function (title, body, bodyType, timeout, clickHndl) {
			popWrap('success', title, body, timeout, bodyType, clickHndl);
		};

		this.clear = toaster.clear;
	};

	toastr.$inject = ['toaster'];

	angular.module('app')
		.service('toastr', toastr);
})();
