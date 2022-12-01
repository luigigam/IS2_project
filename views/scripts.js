function login() {
	var username = document.getElementById("username").value
	var password = document.getElementById("password").value

	fetch("../api/users/login",
		{
			method: "POST",
			headers: {
				'Content-Type': "application/json"
			},
            body: JSON.stringify({ username: username, password: password })
		})
        .then((res) => res.json())
        .catch(err => console.error(err))
}
