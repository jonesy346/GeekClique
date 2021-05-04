# GeekClique

## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)
* [Status](#status)
* [Inspiration](#inspiration)

## General info
This project is a simple chat app designed with Socket.io. Different users can join the app at once, send messages in real time, rate messages, and view the trending messages in a room. If you'd like to simulate the effect of different users joining the app (by yourself), you can open the same program in Google Chrome and a separate incognito window. 

Messages that you rate are saved to your local storage so that closing the browser or opening a new tab in the same window doesn't erase your liked messages. All messages are saved to a MongoDB database on my personal account, so that they remain visible and interactable even after you leave the room.
	
## Screenshots
![image](https://user-images.githubusercontent.com/73217609/116842352-26883380-ab91-11eb-96e1-0b8d4536965e.png)

![image](https://user-images.githubusercontent.com/73217609/116842449-75ce6400-ab91-11eb-89ce-d92aea234590.png)

## Technologies
This project is created with:
* Socket.io version: 3.1.2
* MongoDB version: 3.6.3
* Express version: 4.17.1
	
## Setup
To run this project, install it locally using npm:

```
$ cd ../public
$ npm install
$ npm start
```

## Features
Front page 
* Allows you to choose a username and room to join

Main page
* App automatically updates list of users (in chat sidebar) and broadcasts a message to all users when a user joins/leaves the room
* New messages are automatically broadcast to all users in the room and saved to the database
* All non-admin Messages are rateable
	* Click the "heart" icon if you like a message, "einstein" icon if you think a message is smart, and "laugh" icon if you think a message is funny
	* The ratings are saved to local storage and the database so that refreshing the page doesn't erase your ratings
* The top rated messages are saved in the "View Top Rated Comments" button at the top of the app you can choose to like a message from this screen

## Status
Finished.

## Inspiration
Direct inspiration for project comes from Traversy Media's project. 


