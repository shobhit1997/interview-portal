class Users{
	constructor (){
		this.users=[];
	}
	addUser(id,name,room,source){
		var user={id,name,room,source};
		this.users.push(user);
		return user;
	}
	removeUser(id){
		var user=this.getUser(id);
		console.log(this.users);
		if(user){
			this.users=this.users.filter(function(user){
			return user.id!==id;

		});
		}
		return user;
	}
	getUser(id){

		return this.users.filter(function(user){
			return user.id===id;

		})[0];

	}
	getUserList(room){
	 var users=this.users.filter(function(user) {
	 	return user.room===room;
	 });	
	 var namesArray=users.map(function(user){
	 	return user.name
	 });
	 return namesArray;
	}
	getUserByRoomAndSource(room,source){
	 var users=this.users.filter(function(user) {
	 	return user.room===room&&user.source===source;
	 });
	 return users[0]||false;
	}

}
module.exports={Users};