var app = angular.module("ChatApp", ["ngRoute"]);

app.config(["$routeProvider", function($routeProvider) {
	$routeProvider.when("/", {
		templateUrl: "templates/home.html",
		controller: "LoginController",
	}).when("/room/:roomName", {
		templateUrl: "templates/room.html",
		controller: "RoomController",
	}).when("/rooms/", {
		templateUrl: "templates/rooms.html",
		controller: "RoomsController",
	}).otherwise({ redirectTo: "/" });
}]);;app.factory("SocketService", ["$http", function($http) {
	var username = "";
	var socket = null;
	return {
		setConnected: function(theSocket) {
			socket = theSocket;
		},
		setUsername: function(user) {
			username = user;
		},
		getUsername: function() {
			return username;
		},
		getSocket: function() {
			if (socket === null) {
				this.connect();
			}
			
			return socket;
		},
		connect: function() {
			socket = io.connect('http://localhost:8080');
		}
	};
}]);;app.controller("LoginController", ["$scope", "$location", "SocketService", function($scope, $location, SocketService) {
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
}]);;app.controller("RoomController", ["$scope", "$routeParams", "$location", "SocketService", function($scope, $routeParams, $location, SocketService) {
	$scope.roomName = $routeParams.roomName;
	$scope.currentMessage = "";
	$scope.privateMessage = "";
	$scope.pmMessages = [];

	var socket = SocketService.getSocket();

	if (socket) {
		socket.emit("joinroom", { room: $scope.roomName, pass: "" }, function(success, errorMessage) {
		});

		socket.on("updatechat", function(roomname, messageHistory) {
			console.log(messageHistory);
			$scope.messages = messageHistory;
			document.getElementById('messages').scrollTop = 1000000;
			$scope.$apply();
		});

		socket.on("updateusers", function(room, users) {
			if (room === $scope.roomName) {
				$scope.users = users;
			}
			$scope.$apply();
		});

		socket.on("kicked", function(room, user, userName) {
			if (SocketService.getUsername() === user) {
				console.log("You were kicked from the room");
				$location.path("/rooms");
				$scope.$apply();
			}
			else {
				console.log(SocketService.getUsername() + " kicked " + user);
			}
		});

		socket.on("banned", function(room, user, userName) {
			if (SocketService.getUsername() === user) {
				console.log("You were banned from the room");
				$location.path("/rooms");
				$scope.$apply();
			}
			else {
				console.log(SocketService.getUsername() + " banned " + user);
			}
		});

		socket.on("recv_privatemsg", function(username, message) {
			console.log("privatemessage");
			console.log(username + ": " + message);
			var msgObj = {Sender: username, Message: message};
			$scope.pmMessages.push(msgObj);
			$scope.$apply();	
		});
		// Send message
		$scope.send = function() {
			var kickstring = [];
			var username = "";
			if ($scope.currentMessage.substring(0, 5) === "/Kick") {
				kickstring = $scope.currentMessage.split(' ');
				username = kickstring[1];
				socket.emit("kick", { user: username, room: $scope.roomName, pass: ""  }, function(succes, errorMessage) {
				});
			}
			else if ($scope.currentMessage.substring(0, 4) === "/Ban") {
				kickstring = $scope.currentMessage.split(' ');
				username = kickstring[1];
				socket.emit("ban", { user: username, room: $scope.roomName, pass: "" }, function(success, errorMessage) {
				});
			}
			else {	
				console.log("I sent a message to " + $scope.roomName + ": " + $scope.currentMessage);
				socket.emit("sendmsg", { roomName: $scope.roomName, msg: $scope.currentMessage });	
			}
			$scope.currentMessage = "";
		};
		// On enter
		$scope.keyPress = function($event, inputType) {
			if ($event.keyCode === 13) {
				if (inputType === $scope.currentMessage) {
					$scope.send();
				}
				else if (inputType === $scope.privateMessage) {
					$scope.sendPm();
				}
			}
		};
		// Leave chatroom
		$scope.quit = function(user, roomName) {
		
			console.log("I left the room " + roomName);
			socket.emit("partroom", roomName);

			socket.on("updateusers", function(room, users) {
				if (room === $scope.roomName) {
					$scope.users = users;
					$scope.$apply();
				}
			});

			$location.path("/rooms");
		};
		// Send private message to a user
		$scope.sendPm = function(user) {
			
			socket.emit("privatemsg", { nick: user, message: $scope.privateMessage, pass: "" }, function(success) {

			});
			console.log("I send a private message to " + user);	
			//$scope.pmMessages.push({Sender: SocketService.getUsername(), Message: $scope.privateMessage});
			$scope.privateMessage = "";
			return false;
		};

		$scope.isMe = function(user) {
			return user === SocketService.getUsername();
		};
	}
}]);;app.controller("RoomsController", ["$scope", "$location", "SocketService", function($scope, $location, SocketService) {
	
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