app.controller("LoginController", ["$scope", "$location", "SocketService", function($scope, $location, SocketService) {
	$scope.username = "";
	$scope.message = "";

	var socket = SocketService.getSocket();

	$scope.connect = function() {
		if (socket) {
			socket.emit("adduser", $scope.username, function(available) {
				if (available) {
					SocketService.setConnected(socket);
					SocketService.setUsername($scope.username);

					$location.path("/rooms");
				}
				else {
					$scope.message = "Your name is taken, please choose another";
				}
				$scope.$apply();
			});
		}
	};
	// Can press enter instead of Connect
	$scope.keyPress = function($event) {
		if ($event.keyCode === 13) {
			$scope.connect();
		}
	};
}]);