# GeekClique

## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)
* [Status](#status)
* [Acknowledgments](#acknowledgments)

## General info
This project is a group messaging chat app designed with Socket.io. Different users can join the app at once, send messages in real time, rate messages, and view the trending messages in a room. If you'd like to simulate the effect of different users joining the app (by yourself), you can open the same program in Google Chrome and a separate incognito window. 

All messages are saved to a MongoDB database on my personal account, so that they remain visible and interactable even after you leave the room or close the app. Messages that you rate in a room are saved to your local storage so that closing the browser, opening the program in a new tab in the same window, or leaving the room doesn't erase your liked messages. 

*The Physics room is for sample use. It displays the functionality that is possible when messages are rated.*
	
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
	* The ratings are saved to local storage and the database so that refreshing the page doesn't erase your ratings or those of others
* The top rated messages are saved and interactable by clicking the "View Top Rated Comments" button at the top of the app 
	* If you rate a message from this "Top Rated Comments" screen, it will automatically update the message rating on the main chat app (to avoid double counting)
* You can change rooms by clicking the "Change Room" button, prompting you to either change username or keep it, along with choosing a new room

## Status
Finished.

## Acknowledgments
* Direct inspiration for project comes from YouTuber *Traversy Media*'s tutorial project
	* *Realtime Chat With Users & Rooms - Socket.io, Node & Express*; https://www.youtube.com/watch?v=jD7FnbI76Hg
* Modal design inspired by YouTuber *Web Dev Simplified* 
	* *Build a Popup With JavaScript*; https://www.youtube.com/watch?v=MBaw_6cPmAw
