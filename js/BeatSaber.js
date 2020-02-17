// Author: Dominik Chodounsky
// CSC 385 Computer Graphics
// Version: Winter 2020
// Project 2: Beat Saber class

import * as THREE from '../extern/build/three.module.js';
import * as USER from './User.js';
import * as GUIVR from './GuiVR.js';

export class BeatSaber extends THREE.Group{

    constructor(userRig, animatedObjects, speed, cubeSize, spawnRate){
        super();

        var game = new THREE.Group();
        game.score = 0;
        game.started = false;
        game.speed = speed;
        game.cubeSize = cubeSize;
        game.spawnRate = spawnRate;
        game.cubes = [];
        this.add(game);

        // Tunnel for cubes to fly in
        var tunnel = new THREE.Group();
        tunnel.position.z = -12;
        game.add(tunnel);

        var tunnelMat = new THREE.MeshLambertMaterial( {color: 0x7D8384, side: THREE.DoubleSide} );

        for(var j = 0; j < 2; ++j){
            var horizontalGeo = new THREE.PlaneBufferGeometry( 6, 30, 1 );
            var horizontal = new THREE.Mesh( horizontalGeo, tunnelMat );
            horizontal.position.set(0, 0.05 + j * 4, -1);
            horizontal.rotation.x = THREE.Math.degToRad(90);
            tunnel.add(horizontal);
        }

        for(var j = 0; j < 2; ++j){
            var verticalGeo = new THREE.PlaneBufferGeometry(28, 4, 1);
            var vertical = new THREE.Mesh(verticalGeo, tunnelMat);
            vertical.position.set(-3 + j * 6, 2.05, -2);
            vertical.rotation.y = THREE.Math.degToRad(90);
            tunnel.add(vertical);
        }

        // Back wall
        var backGeo = new THREE.PlaneBufferGeometry(6, 4.1, 1);
        var back = new THREE.Mesh(backGeo, tunnelMat);
        back.position.set(0, 2.05, -16);
        tunnel.add(back);

        // Text on back wall announcing the score
        var text;
        var fontLoader = new THREE.FontLoader();
	    fontLoader.load('../extern/fonts/helvetiker_bold.typeface.json', function (font){
	        var textGeo = new THREE.TextBufferGeometry("Score: " + game.score, {
		        font: font,
		        size: 0.7,
		        height: 0.02,
		        curveSegments: 3,
	        });
	        var textMat = new THREE.MeshPhongMaterial({color: 0xff0000});
            text = new THREE.Mesh(textGeo, textMat);
            text.position.z = 0.2;
            text.position.x = -2.8;
            back.add(text);
	    });

        var pillarGeo = new THREE.CylinderBufferGeometry( 0.05, 0.05, 4.1, 32 );
        var pillarMat = new THREE.MeshLambertMaterial( {color: 0x0000ff} );

        for(var j = 0; j < 2; ++j){
            var pillar = new THREE.Mesh( pillarGeo, pillarMat );
            pillar.position.set(-3 + j * 6, 2.05, 14);
            tunnel.add(pillar);
        }

        // Window to show where cubes spawn
        var window = new THREE.Group();
        window.position.z = -20;

        var geometry = new THREE.CylinderBufferGeometry( 0.05, 0.05, 6, 32 );
        var material = new THREE.MeshLambertMaterial( {color: 0xff0000} );

        for(var j = 0; j < 2; ++j){
            var width = new THREE.Mesh( geometry, material );
            width.position.y = 0.05 + j * 4;
            width.rotation.z = THREE.Math.degToRad(90);
            window.add(width);
        }

        geometry = new THREE.CylinderBufferGeometry( 0.05, 0.05, 4.1, 32 );

        for(var j = 0; j < 2; ++j){
            var height = new THREE.Mesh( geometry, material );
            height.position.y = 2.05;
            height.position.x = -3 + j * 6;
            window.add(height);
        }
        game.add(window);


        const loader = new THREE.TextureLoader();

        var saber = new THREE.Group();
        var handleGeo = new THREE.CylinderBufferGeometry( 0.07, 0.07, 0.3, 32 );
        var handleMat = new THREE.MeshPhongMaterial( {color: 0x9F9EA1} );
        var handle = new THREE.Mesh(handleGeo, handleMat);
        saber.add(handle);

        var lightGeo = new THREE.CylinderBufferGeometry( 0.03, 0.03, 2, 32 );
        var lightMat = new THREE.MeshPhongMaterial({
            map: loader.load('../textures/blue_saber.jfif')
        } );
        var light = new THREE.Mesh(lightGeo, lightMat);

        light.position.y = 2 / 2;
        saber.add(light);

        var sphereGeo = new THREE.SphereBufferGeometry( game.cubeSize + 0.1, 32, 32 );
        var sphereMat = new THREE.MeshBasicMaterial( {color: 0xffff00, visible: false} );
        var hitBoxSphere = new THREE.Mesh(sphereGeo, sphereMat);
        hitBoxSphere.position.y = 2.3 - (game.cubeSize + 0.1);
        hitBoxSphere.radius = game.cubeSize + 0.1;
        saber.hitBox = hitBoxSphere;
        saber.add(hitBoxSphere);

        game.setAnimation(
            function(dt){
                if(this.t == undefined){
                    this.t = 0;
                }
                this.t += dt;
                
                //console.log("Testing, CHILDREN: " + this.cubes.length);
                for(var i = 0; i < this.cubes.length; ++i){
                    if(spheresIntersect(saber.hitBox, this.cubes[i].hitBox)){
                        this.score += 1;
                        this.remove(this.cubes[i]);
                        this.cubes.shift();
                        console.log("Score: " + this.score);

                        back.remove(back.children[0]);
                        var fontLoader = new THREE.FontLoader();
                        fontLoader.load('../extern/fonts/helvetiker_bold.typeface.json', function (font){
                            var textGeo = new THREE.TextBufferGeometry("Score: " + game.score, {
                                font: font,
                                size: 0.7,
                                height: 0.02,
                                curveSegments: 3,
                            });
                            var textMat = new THREE.MeshPhongMaterial({color: 0xff0000});
                            text = new THREE.Mesh(textGeo, textMat);
                            text.position.z = 0.1;
                            text.position.x = -2.8;
                            back.add(text);
                        });
                    }
                }

                if(Math.floor(this.t) % 10 == 0){
                    this.t = Math.ceil(this.t);

                    var geometry = new THREE.BoxBufferGeometry( 0.3, 0.3, 0.3 );
                    var material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
                    var cube = new THREE.Mesh( geometry, material );
                    cube.position.set(getRandomInt(-2.95 + 0.3, 2.95 - 0.3), getRandomInt(0.05 + 0.3, 4.05 - 0.3), -10);

                    sphereGeo = new THREE.SphereBufferGeometry( 0.73 * game.cubeSize, 32, 32 );
                    sphereMat = new THREE.MeshBasicMaterial( {color: 0xffff00, visible: false} ); // visible true to show hitbox
                    var hitBoxSphere = new THREE.Mesh(sphereGeo, sphereMat);
                    hitBoxSphere.radius = 0.73 * game.cubeSize;
                    cube.hitBox = hitBoxSphere;
                    cube.speed = game.speed;
                    cube.add(hitBoxSphere);

                    this.cubes.push(cube);
                    //console.log("Added, CHILDREN: " + this.cubes.length);

                    this.add(cube); 
                    cube.setAnimation(
                        function (dt){
                        if (this.t == undefined){
                            this.t = 0;
                        }
                        this.t += dt;
                        this.position.z += game.speed * dt;
                        
                        if (this.position.z > 0 && this.removed == undefined){
                            game.remove(this);
                            game.cubes.shift();
                            this.removed = true;
                        }
                        });
                        animatedObjects.push(cube);
                        }
                        
                        
                }
            
        )
        animatedObjects.push(game);   
            
            this.add(new USER.UserPlatform(
            userRig,
            function (){
                console.log("Landing at Beat Saber game");
                // Get controller's position
                let controller = userRig.getController(0);
                // Add new model for controller (should be removed on leaving).
                saber.rotation.x = THREE.Math.degToRad(-30);
                controller.add(saber);
                // Set animation to check whether trigger button is
                // pressed and then fire a projectile in the frame of the
                // controller if is and enough time has elapsed since last
                // firing.
                controller.setAnimation(
                function (dt){
                    if (this.t == undefined){
                    this.t = 0;
                    }
                    this.t += dt;
                }
                );
            
            },
            function (){
                console.log("Leaving Beat Saber game");
                let controller = userRig.getController(0);
                // Clear the model added to controller.
                controller.remove(saber);
                // Remove special animation attached to controller.
                controller.setAnimation(undefined);
            }
            ));  


        // Make a GUI sign.
        var buttons = [new GUIVR.GuiVRButton("Speed", 1, 0, 10, true,
	    				 function(x){})];
        var sign = new GUIVR.GuiVRMenu(buttons);
        sign.position.x = 0;
        sign.position.z = -2;
        sign.position.y = 0.5;

    }
}   

function spheresIntersect(sphere1, sphere2){
    var vec1 = new THREE.Vector3();
    var vec2 = new THREE.Vector3();

    sphere1.getWorldPosition(vec1);
    sphere2.getWorldPosition(vec2);

    /*console.log(vec1);
    console.log(vec2);
    console.log(vec1.distanceTo(vec2));*/

    return vec1.distanceTo(vec2) <= (sphere1.radius + sphere2.radius);
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}