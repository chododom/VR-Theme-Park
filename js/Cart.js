// Author: Dominik Chodounsky
// CSC 385 Computer Graphics
// Version: Winter 2020
// Project 2: Cart class

import * as THREE from '../extern/build/three.module.js';
import { GuiVR } from './GuiVR.js';

// Class to represent the carts of a Ferris Wheel
export class Cart extends GuiVR{

    constructor(userRig, signRig, speed, y, animatedObjects, dir){
        super();

        const loader = new THREE.TextureLoader();
        var cartGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.7, 9, 1, false, 1, 6.3);
        var cartMat = new THREE.MeshPhongMaterial( {
            map: loader.load('../textures/glass.jpg')
        } );

        this.position.y = -2.75;
        this.speed = speed;

        var cart = new THREE.Mesh(cartGeo, cartMat);
        cart.position.y = y;
        this.add(cart);

        // Rotation to counter the rotation of the wheel
        this.setAnimation(
            function (dt){
                if(dir == 0) this.rotation.z -= this.speed * 0.01;
                else this.rotation.z += this.speed * 0.01;
            });
        animatedObjects.push(this);

	    this.collider = cart;
        this.userRig = userRig;
        this.signRig = signRig;
    }

    // Clicking on cart sits user on top of it and adjusts his view
    collide(uv, pt){
        // When the user clicks on this platform, move the user to it.
        this.add(this.userRig);

        // face the ride direction
        this.userRig.rotation.y = THREE.Math.degToRad(120);

        // add sign to user rig
        this.signRig.rotation.y = THREE.Math.degToRad(110);
        this.add(this.signRig);
    }
}
