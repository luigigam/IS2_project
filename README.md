# BIBEMVS <img src="BIBEMVS_LOGO.png" alt="BIBEMVS_LOGO" width="50"/>

This project is the result of the course Ingegneria del Software 2,
BIBEMVS is an e*commerce stile web service with the focus on Italian national wines and spirits.

# packages used (the order is randomic):
* express: provides broad features for building web and mobile applications, is a MUST for developing application like this
* bcrypt: provides utilities for the encryption of passwords, is vital for services that have user registration steps, it guaranties the safety of passwords and data
* jsonwebtoken: very useful after the autentication, it provides the user a web token (JWT) and subsequent requests by the user will include the assigned JWT. This token tells the server what routes, services, and resources the user is allowed to access
* mongodb: online database used to store data
* mongoose: provides several functions in order to manipulate the documents of the collection of the MongoDB database
* dotenv: great way to keep passwords, API keys, and other sensitive data safe. It allows also to create environment variables in a .env file
* nodemon: provides useful utilities while programming and testing, for each save in the code it refreshes the server
* prettier: for a e s t h e t i c purposes

# how to run the project:
    $ npm run devStart

# credits
Luigi Gammino, unitn

![BIBEMVS](BIBEMVS.png)