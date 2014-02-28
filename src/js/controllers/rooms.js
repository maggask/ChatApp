app.controller("RoomsController", ["$scope", "$location", "SocketService", function($scope, $location, SocketService) {
	
	var socket = SocketService.getSocket();
	$scope.roomlist = [];
	
	if (socket) {
		socket.emit("rooms");

		socket.on("roomlist", function(roomlist) {
			$scope.roomlist = [];
			for (var item in roomlist) {
				$scope.roomlist.push(item);
			}
			$scope.$apply();
		});	
		// Create new room
		$scope.create = function() {
			
			console.log("I created a new room " + $scope.roomname);

			if ($scope.roomname === undefined) {
				$scope.message = "You have to choose a name for your room!";
			}
			else {
				socket.emit("joinroom", { room: $scope.roomname, pass: "" }, function(success, errorMessage) {
				});
				socket.on("updateusers", function(room, users) {
					if (room === $scope.roomName) {
						$scope.users = users;
					}
					$scope.$apply();
				});
				$location.path("/room/" + $scope.roomname);
			}
		};
		// Enter an existing room
		$scope.enter = function(roomname) {

			console.log("I entered an existing room " + roomname);
			socket.emit("joinroom", { room: roomname, pass: "" }, function(success, errorMessage) {
				console.log(success);
				if (success === false) {
					$location.path("/rooms");
					$scope.$apply();
					console.log("You were banned from this room, you can not re-enter!");
				}
			});
			$location.path("/room/" + roomname);		
		};
		// On enter
		$scope.keyPress = function($event) {
			if ($event.keyCode === 13) {
				$scope.create();
			}
		};
	}
}]);