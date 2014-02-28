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
}]);