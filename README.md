# VR Theme park
Project created in CSC 385 (Computer Graphics) at Union College, NY, USA. The goal was to use THREE JS to create a VR theme park with a ride (I chose a ferris wheel) and a game (I recreated a simple version of Beatsaber).

## Ferris Wheel exhibit
- adjustable parameters: wheel shape, cabin count, speed, direction
- adjustments possible by passing in constructor and also in-game with use of sliders
- sometimes, sliders bug and stay pinned to cabins (I think it's a bug in given User.js code, but maybe the error is on my side, everything that I tried didn't fix it)

## Beat Saber 2.0 game
- adjustable parameters: cube speed, cube size, spawn rate of cubes
- adjustable both by passing parameters or in-game before the start of a round
- includes music, so #SOUND_ON (sometimes browser doesn't play sound immediately, so use START button to turn the game off and back on and it should play, the experience is much more fun with the music on)
- light saber model was a last minute attachment, hitbox should work (was adjusted accordingly), but it is generally better to hit in a stabbing motion closer to the tip of the lightsaber and not swing too fast, the animation loop isn't updating fast enough for certain speeds
- plays better on the Oculus Quest and HTC Vive, addittional DOF for headset make it easier to reach cubes and line up hitboxes, but the Go works too
- as for raycaster lasers, I wanted to make the controller pointer disappear, but the controller class acts strangely, the User.controllers does not include only one
controller for the Go, so I can't tell which device is being used, therefore to keep the option of ending the game from the Go as well (other two could use controller without mapped lightsaber to point and click), there is always a laser as well as the lightsaber
- (fun fact: I was this close *shows tiny distance between fingers* to adding dancing storm troopers to my game, but decided to respect your wishes not to see any of those)
