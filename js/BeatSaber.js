// Author: Dominik Chodounsky
// CSC 385 Computer Graphics
// Version: Winter 2020
// Project 2: Beat Saber class

import * as THREE from '../extern/build/three.module.js';
import * as USER from './User.js';
import * as GUIVR from './GuiVR.js';
import {GLTFLoader}  from '../extern/examples/jsm/loaders/GLTFLoader.js';

// Class to build and animate game of Beat Saber 2.0
export class BeatSaber extends THREE.Group{

    constructor(userRig, animatedObjects, speed, cubeSize, spawnRate){
        super();

        // Game group containing animations
        var game = new THREE.Group();
        game.score = 0;
        game.started = false;
        game.animated = false;
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

        // Tunnel floor and ceiling
        for(var j = 0; j < 2; ++j){
            var horizontalGeo = new THREE.PlaneBufferGeometry( 6, 30, 1 );
            var horizontal = new THREE.Mesh( horizontalGeo, tunnelMat );
            horizontal.position.set(0, 0.05 + j * 4, -1);
            horizontal.rotation.x = THREE.Math.degToRad(90);
            tunnel.add(horizontal);
        }

        // Tunnel sides
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

        // Buffer geometry arrows to show direction of cubes
        var arrowGeo = new THREE.BufferGeometry();
        var vertices = new Float32Array( [
             1, 3, 0,
            -1, 3, 0,
            -1, 0, 0,

            -1, 0, 0,
             1, 0, 0,
             1, 3, 0,

             2, 0, 0,
             0, 0, 0,
             0, -2, 0,

             0, -2, 0,
             0, 0, 0,
            -2, 0, 0  
        ] );

        // itemSize = 3 because there are 3 values (components) per vertex
        arrowGeo.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        var arrowMat = new THREE.MeshBasicMaterial( { color: 0xBC403C, side: THREE.DoubleSide } );
        var arrow = new THREE.Mesh( arrowGeo, arrowMat );
        arrow.scale.set(0.14, 1, 0.2);
        arrow.position.z = -4;
        arrow.position.y = 0.1;
        arrow.rotation.x = THREE.Math.degToRad(-90);
        game.add(arrow);

        for(var j = 0; j < 2; ++j){
            var sideArrow = arrow.clone();
            sideArrow.position.x = -1.5 + j * 3;
            sideArrow.position.z = -6;
            game.add(sideArrow);
        }

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

        // Pillars at beginning of tunnel
        var pillarGeo = new THREE.CylinderBufferGeometry( 0.05, 0.05, 4.1, 32 );
        var pillarMat = new THREE.MeshLambertMaterial( {color: 0x0000ff} );

        for(var j = 0; j < 2; ++j){
            var pillar = new THREE.Mesh( pillarGeo, pillarMat );
            pillar.position.set(-3 + j * 6, 2.05, 14);
            tunnel.add(pillar);
        }

        // Window to show where cubes spawn
        var window = new THREE.Group();
        window.position.z = -14;

        var geometry = new THREE.CylinderBufferGeometry( 0.05, 0.05, 6, 32 );
        var material = new THREE.MeshLambertMaterial( {color: 0xff0000} );

        // Horizontal parts of window
        for(var j = 0; j < 2; ++j){
            var width = new THREE.Mesh( geometry, material );
            width.position.y = 0.05 + j * 4;
            width.rotation.z = THREE.Math.degToRad(90);
            window.add(width);
        }

        geometry = new THREE.CylinderBufferGeometry( 0.05, 0.05, 4.1, 32 );

        // Vertical parts of window
        for(var j = 0; j < 2; ++j){
            var height = new THREE.Mesh( geometry, material );
            height.position.y = 2.05;
            height.position.x = -3 + j * 6;
            window.add(height);
        }
        game.add(window);

        // Instructions background
        var instBackGeo = new THREE.PlaneGeometry(2, 1.5, 1);
        var instBackMat = new THREE.MeshBasicMaterial( {color: 0xDCDCDC, side: THREE.DoubleSide} );
        var instBack = new THREE.Mesh(instBackGeo, instBackMat);
        instBack.position.y = 2;
        instBack.position.z = -3;

        // Text of instructions
        var instText;
        var fontLoader = new THREE.FontLoader();
	    fontLoader.load('../extern/fonts/helvetiker_bold.typeface.json', function (font){
	        var instTextGeo = new THREE.TextBufferGeometry("Welcome to Beat Saber 2.0 !\n\nYour goal is to hit as many cubes flying at you with\nyou awesome lightsaber. You can adjust the speed\nof the flying cubes, their size and the time gap between\ntheir spawns.\nWhenever you are ready to play, toggle on the START\nbutton and you will get your lightsaber and the game\nwill start. To end the game, toggle it back off.\n\nPro tip: Try to use the tip of the lightsaber (hitbox is\ncloser to its end) and stab\nthe cubes, slicing may not always be the best move\neven though it looks cool ;)\n\nHave fun!", {
		        font: font,
		        size: 0.05,
		        height: 0.01,
		        curveSegments: 3,
	        });
	        var instTextMat = new THREE.MeshPhongMaterial({color: 0x2198A1});
            instText = new THREE.Mesh(instTextGeo, instTextMat);
            instText.position.z = 0.1;
            instText.position.x = -0.9;
            instText.position.y = 0.6;
            instBack.add(instText);
        });
        
        // Add soundtrack
        var listener = new THREE.AudioListener();
        game.add(listener);

        var sound = new THREE.Audio( listener );

        var audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'sounds/balearic_pumping.mp3', function( buffer ) {
	        sound.setBuffer( buffer );
	        sound.setLoop( true );
	        sound.setVolume( 0.5 );
        });

        // Light saber modeled in THREE JS by me
        /*const loader = new THREE.TextureLoader();

        var saber = new THREE.Group();
        var handleGeo = new THREE.CylinderBufferGeometry( 0.07, 0.07, 0.3, 32 );
        var handleMat = new THREE.MeshPhongMaterial( {color: 0x9F9EA1} );
        var handle = new THREE.Mesh(handleGeo, handleMat);
        saber.add(handle);

        var lightGeo = new THREE.CylinderBufferGeometry( 0.03, 0.03, 2.3, 32 );
        var lightMat = new THREE.MeshPhongMaterial({
            map: loader.load('../textures/blue_saber.jfif')
        } );
        var light = new THREE.Mesh(lightGeo, lightMat);

        light.position.y = 2.3 / 2;
        saber.add(light);*/

        // Light saber downloaded at 'https://sketchfab.com/3d-models/lightsaber-1e95a8ccbbfe4732891eb76a683e9c29'
        var saber = new THREE.Group();
        var loader = new GLTFLoader().setPath('../extern/models/lightsaber/');
        // Load a glTF resource
        loader.load(
        'scene.gltf',
        (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02);
        const box = new THREE.Box3().setFromObject( gltf.scene );
        const center = box.getCenter( new THREE.Vector3() );
        gltf.scene.position.x += ( gltf.scene.position.x - center.x );
        gltf.scene.position.y += ( gltf.scene.position.y - center.y );
        gltf.scene.position.z += ( gltf.scene.position.z - center.z );
        saber.add(gltf.scene);
        },
        (xhr) => {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        (error) => {
        console.log( 'An error happened' );
        console.log(error);
        }
        );

        saber.position.z = -0.5;
        saber.position.y = 0.4;

        // Create light saber's hitbox sphere
        var sphereGeo = new THREE.SphereBufferGeometry( game.cubeSize + 0.2, 32, 32 );
        var sphereMat = new THREE.MeshBasicMaterial( {color: 0xffff00, visible: false} );
        var hitBoxSphere = new THREE.Mesh(sphereGeo, sphereMat);
        hitBoxSphere.position.y = 1.1 - (game.cubeSize + 0.2) ;
        hitBoxSphere.radius = game.cubeSize + 0.2;
        saber.hitBox = hitBoxSphere;
        saber.rotation.x = THREE.Math.degToRad(-45);
        saber.add(hitBoxSphere);

        // Game animation loop
        game.setAnimation(
            function(dt){
                if(this.t == undefined){
                    this.t = 0;
                }
                this.t += dt;
                
                if(!this.started) return;

                //console.log("Testing, CHILDREN: " + this.cubes.length);

                // Check for cube hit
                for(var i = 0; i < this.cubes.length; ++i){
                    if(spheresIntersect(saber.hitBox, this.cubes[i].hitBox)){
                        this.score += 1;
                        this.remove(this.cubes[i]);
                        this.cubes.shift();
                        console.log("Score: " + this.score);

                        // Update score
                        back.remove(text);
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

                // Spawn new cube
                if(Math.floor(this.t) % game.spawnRate == 0){
                    this.t = Math.ceil(this.t);

                    var geometry = new THREE.BoxBufferGeometry(game.cubeSize, game.cubeSize, game.cubeSize);
                    var material = new THREE.MeshLambertMaterial( {color: 0xFE1008} );
                    var cube = new THREE.Mesh( geometry, material );
                    cube.position.set(getRandom(-2.2 + game.cubeSize, 2.1 - game.cubeSize), getRandom(0.05 + game.cubeSize, 1.4 + 2.1 - game.cubeSize), window.position.z);

                    // Cube hitbox sphere
                    sphereGeo = new THREE.SphereBufferGeometry( 0.73 * game.cubeSize, 32, 32 );
                    sphereMat = new THREE.MeshBasicMaterial( {color: 0xffff00, visible: false} ); // visible true to show hitbox
                    var hitBoxSphere = new THREE.Mesh(sphereGeo, sphereMat);
                    hitBoxSphere.radius = 0.73 * game.cubeSize;
                    cube.hitBox = hitBoxSphere;
                    cube.add(hitBoxSphere);

                    this.cubes.push(cube);
                    //console.log("Added, CHILDREN: " + this.cubes.length);

                    this.add(cube); 

                    // Cube animation loop
                    cube.setAnimation(
                        function (dt){
                        if (this.t == undefined){
                            this.t = 0;
                        }

                        if(!game.started) {
                            this.removed = true;
                            game.remove(this);
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
        
        // Platform for user to stand on
        var platform = new USER.UserPlatform(
        userRig,
        function (){
            console.log("Landing at Beat Saber game");            
        },
        function (){
            console.log("Leaving Beat Saber game");
            let controller = userRig.getController(0);
            // Clear the model added to controller.
            controller.remove(saber);
            // Remove special animation attached to controller.
            controller.setAnimation(undefined);
            // Turn off sound
            if(sound.isPlaying) sound.stop();
        }
        );
        this.add(platform);

        var inited = false;

        // GUI design
        var buttons = [new GUIVR.GuiVRButton("Speed", game.speed, 1, 3, false,
                         function(x){
                            if(inited) game.speed = x;
                         }),
                        new GUIVR.GuiVRButton("Cube size", game.cubeSize, 0.3, 0.8, false,
                        function(x){
                            game.cubeSize = x;

                            // Reshape lightsaber's hitbox
                            if(inited){
                                saber.remove(saber.hitBox);
                                let sphereGeo = new THREE.SphereBufferGeometry( x + 0.1, 32, 32 );
                                let sphereMat = new THREE.MeshBasicMaterial( {color: 0xffff00, visible: false} ); // visible true to show hitbox
                                let hitBoxSphere = new THREE.Mesh(sphereGeo, sphereMat);
                                hitBoxSphere.position.y = 2.3 - (x + 0.1);
                                hitBoxSphere.radius = x + 0.1;
                                saber.hitBox = hitBoxSphere;
                                saber.add(hitBoxSphere);
                            }
                        }),
                        new GUIVR.GuiVRButton("Gap", game.spawnRate, 7, 20, true,
                         function(x){
                            if(inited) game.spawnRate = x;
                         }) 
                    ];

        var sign = new GUIVR.GuiVRMenu(buttons);
        sign.position.x = -2;
        sign.position.z = -3;
        sign.position.y = 0.5;
        sign.rotation.y = THREE.Math.degToRad(25);
        game.add(sign);

        // START button design
        var startSign = new GUIVR.GuiVRMenu([new GUIVR.GuiVRButton("START", 0, 0, 1, true,
                    function(x){
                        if(x == 1){
                            game.started = true;
                            if(inited){
                                console.log("Game starting"); 
                                if(!sound.isPlaying) {console.log("Sound ON"); sound.play();}
                                if(!game.animated) animatedObjects.push(game);
                                game.animated = true;
                                game.remove(sign);
                                
                                let controller = userRig.getController(0);
                                controller.add(saber);

                                game.remove(instBack)

                                // Map lightsaber to controler and turn off raycaster (controller code in User.js doesn't work)
                                /*let controller = userRig.getController(0);
                                if(userRig.controllers.length == 1){
                                    controller.add(saber);
                                }
                                else{
                                    for(var i = 0; i < controller.children.length; ++i){
                                        if(controller.children[i].name == 'pointer'){
                                            controller.remove(controller.children[i]);
                                            game.pointer = controller.children[i];
                                        }
                                    }
                                    controller.add(saber);
                                }*/
                            }
                        }
                        else{
                            game.add(instBack);
                            if(inited){
                                if(sound.isPlaying) sound.stop();
                                console.log("Game stopped");
                                game.score = 0;
                                game.started = false;
                                game.cubes = [];

                                game.add(sign);

                                let controller = userRig.getController(0);
                                controller.remove(saber);

                                console.log("Resetting scoreboard");
                                back.remove(text);
                                var fontLoader = new THREE.FontLoader();
                                fontLoader.load('../extern/fonts/helvetiker_bold.typeface.json', function (font){
                                    var textGeo = new THREE.TextBufferGeometry("Score: 0", {
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
                            }
                        }
                    }
        )]);

        startSign.position.x = -2;
        startSign.position.z = -3;
        startSign.position.y = 1;
        startSign.rotation.y = THREE.Math.degToRad(25);
        game.add(startSign)

        inited = true;
    }
}   

// Function to determine if two spheres intersect in order to determine light saber hitting cube
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

// Get random float between min and max
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}