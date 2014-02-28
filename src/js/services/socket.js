app.factory("SocketService", ["$http", function($http) {
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
}]);