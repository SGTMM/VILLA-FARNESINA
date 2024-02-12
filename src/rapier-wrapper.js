import rapier from "@dimforge/rapier3d-compat";

var rigidBodies = [];

var time;

rapier.init().then(() => {

    window.setupPhysics = setupPhysics;
    window.updatePhysics = updatePhysics;
    window.dynamicBox = dynamicBox;
    window.dynamicSphere = dynamicSphere;
    window.fixedBox = fixedBox;
    window.MoveController = MoveController;
    window.fixedCylinder = fixedCylinder;
    window.kinematicBox = kinematicBox;
    window.BoxCollider = BoxCollider;
    window.kinematicSphere = kinematicSphere;
    window.CheckCollision = CheckCollision;
    window.Contact = Contact;
    window.test2 = test2;
    window.eulerToQuaternion = eulerToQuaternion;
    window.physics_ready = true
    window.checkGrounded = checkGrounded
    window.checkCharacterCollision = checkCharacterCollision
    window.castRay = castRay
    window.removeCollider = removeCollider
    window.testPlayerGround = testPlayerGround
});

var world, gravity;

let eventQueue;

var prev_pos;

let characterController;

var y = 0;

var handle = { handle1: null, handle2: null };

const setupPhysics = () => {
    gravity = { x: 0.0, y: -9.81, z: 0.0 };
    world = new rapier.World(gravity);
    eventQueue = new rapier.EventQueue(true);
    characterController = world.createCharacterController(0.01);
    characterController.setUp({ x: 0.0, y: 1.0, z: 0.0 });
    characterController.enableAutostep(1, 0, true);
    //characterController.setMinSlopeSlideAngle(350 * Math.PI / 180);
    //characterController.enableSnapToGround(10)
    time = new Date();
    return world
}

const removeCollider = (obj) => {
    world.removeCollider(obj.userData.physicsBody)
}

const testPlayerGround = (obj, x, z, delta, vel, collider) => {

    //MUST SEE VERLET INTERGRATION FRO GRAVITY IMPLEMENTATION
    y = vel * delta + 0.5 * -9.81 * delta * delta

    characterController.computeColliderMovement(
        obj.userData.physicsBody.userData,
        { x: x, y: y, z: z },
        undefined,
        undefined,
        collider
    )

    let correctedMovement = characterController.computedMovement();
    //console.log(correctedMovement.y + obj.position.y, prev_pos + 0.02)
    if (correctedMovement.y + obj.position.y < prev_pos) {
        //console.log("ciao")
        obj.position.y += correctedMovement.y
        obj.move({ x: obj.position.x, y: obj.position.y, z: obj.position.z })
    }

    prev_pos = obj.position.y

    return correctedMovement
}

const MoveController = (obj, x, z, delta, vel, bypass) => {

    //MUST SEE VERLET INTERGRATION FRO GRAVITY IMPLEMENTATION
    prev_y = obj.position.y
    if (bypass) {
        y = vel * delta + 0.5 * -9.81 * delta * delta
    } else {
        y = 0
    }

    characterController.computeColliderMovement(
        obj.userData.physicsBody.userData,
        { x: x, y: y, z: z }
    )

    let correctedMovement = characterController.computedMovement();
    obj.position.x += correctedMovement.x
    obj.position.y += correctedMovement.y
    obj.position.z += correctedMovement.z
    obj.move({ x: obj.position.x, y: obj.position.y, z: obj.position.z })

    return correctedMovement
}

const fixedBox = (pos, scale, quat, visible) => {
    var obj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(obj)

    obj.position.x = pos.x
    obj.position.y = pos.y
    obj.position.z = pos.z

    obj.scale.x = scale.x
    obj.scale.y = scale.y
    obj.scale.z = scale.z

    obj.rotation.x = quat.x
    obj.rotation.y = quat.y
    obj.rotation.z = quat.z
    obj.visible = visible
    var rbInfo = rapier.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z)
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    angle = { x: obj.quaternion.x, y: obj.quaternion.y, z: obj.quaternion.z, w: obj.quaternion.w }
    var rbColliderInfo = rapier.ColliderDesc.cuboid(scale.x / 2, scale.y / 2, scale.z / 2).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(rapier.ActiveCollisionTypes.DEFAULT | rapier.ActiveCollisionTypes.KINEMATIC_FIXED);
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider
    return obj;
}

const kinematicBox = (pos, scale, quat, visible) => {
    var obj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(obj)

    obj.position.x = pos.x
    obj.position.y = pos.y
    obj.position.z = pos.z

    obj.scale.x = scale.x
    obj.scale.y = scale.y
    obj.scale.z = scale.z

    obj.rotation.x = quat.x
    obj.rotation.y = quat.y
    obj.rotation.z = quat.z
    obj.visible = visible
    var rbInfo = rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z)
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var rbColliderInfo = rapier.ColliderDesc.cuboid(scale.x / 2, scale.y / 2, scale.z / 2).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(rapier.ActiveCollisionTypes.DEFAULT | rapier.ActiveCollisionTypes.KINEMATIC_FIXED);
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider

    // functions

    obj.move = (pos) => {
        obj.position.x = pos.x
        obj.position.y = pos.y
        obj.position.z = pos.z
        obj.userData.physicsBody.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })
    }

    return obj
}

const BoxCollider = (pos, scale, quat, visible) => {
    if (visible === true) {
        var obj = box(pos.x, pos.y, pos.z, scale.x, scale.y, scale.z);
        obj.setRotationX(quat.x)
        obj.setRotationY(quat.y)
        obj.setRotationZ(quat.z)
    }
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var ColliderInfo = rapier.ColliderDesc.cuboid(scale.x / 2, scale.y / 2, scale.z / 2).setTranslation(pos.x, pos.y, pos.z).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(rapier.ActiveCollisionTypes.DEFAULT | rapier.ActiveCollisionTypes.KINEMATIC_FIXED);
    var Collider = world.createCollider(ColliderInfo);
    Collider.setSensor(true);
    return Collider
}

const fixedCylinder = (pos, radius, height, quat) => {
    var obj = cylinder(pos.x, pos.y, pos.z, radius, height);
    obj.setRotationX(quat.x)
    obj.setRotationY(quat.y)
    obj.setRotationZ(quat.z)
    var rbInfo = rapier.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z)
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var rbColliderInfo = rapier.ColliderDesc.cylinder(height / 2, radius).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(rapier.ActiveCollisionTypes.DEFAULT | rapier.ActiveCollisionTypes.KINEMATIC_FIXED)
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider
    return obj
}

const dynamicBox = (pos, scale, quat, mass) => {
    var obj = box(pos.x, pos.y, pos.z, scale.x, scale.y, scale.z)
    obj.setRotationX(quat.x)
    obj.setRotationY(quat.y)
    obj.setRotationZ(quat.z)
    var rbInfo = rapier.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z)
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var rbColliderInfo = rapier.ColliderDesc.cuboid(scale.x / 2, scale.y / 2, scale.z / 2).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS);
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider
    rigidBodies.push(obj);

    //functions
    obj.applyImpulse = (vec) => {
        obj.userData.physicsBody.applyImpulse(vec, true);
    }

    return obj
}

const kinematicSphere = (pos, radius, quat) => {
    var obj = sphere(pos.x, pos.y, pos.z, radius);
    obj.setRotationX(quat.x)
    obj.setRotationY(quat.y)
    obj.setRotationZ(quat.z)
    var rbInfo = rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z)
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var rbColliderInfo = rapier.ColliderDesc.ball(radius).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(rapier.ActiveCollisionTypes.DEFAULT | rapier.ActiveCollisionTypes.KINEMATIC_FIXED);
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider

    // functions

    obj.move = (pos) => {
        obj.position.x = pos.x
        obj.position.y = pos.y
        obj.position.z = pos.z
        obj.userData.physicsBody.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })
    }

    return obj
}

const dynamicSphere = (pos, radius, quat, mass) => {
    var obj = sphere(pos.x, pos.y, pos.z, radius);
    obj.setRotationX(quat.x)
    obj.setRotationY(quat.y)
    obj.setRotationZ(quat.z)
    var rbInfo = rapier.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z);
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var rbColliderInfo = rapier.ColliderDesc.ball(radius).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setRestitution(0.7).setRestitutionCombineRule(rapier.CoefficientCombineRule.Average);;
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider
    rigidBodies.push(obj);

    // functions

    obj.applyImpulse = (vec) => {
        obj.userData.physicsBody.applyImpulse(vec, true);
    }

    return obj;
}

const CheckCollision = () => {
    eventQueue.drainCollisionEvents((handle1, handle2, started) => {
        //console.log(handle1, handle2)
        handle = { handle1: handle1, handle2: handle2 };
    })
}

const checkCharacterCollision = (obj) => {
    if (characterController.computedCollision() != undefined) {
        if (characterController.computedCollision().hasOwnProperty("collider")) {
            return characterController.computedCollision().collider.handle
        }
    }
}

const checkGrounded = (obj) => {
    if (characterController.computedCollision() != undefined) {
        if (characterController.computedCollision().hasOwnProperty("collider")) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

const Contact = (obj1, obj2) => {
    var handle1, handle2;
    if (obj1.hasOwnProperty("userData")) {
        handle1 = obj1.userData.physicsBody.userData.handle;
    } else {
        handle1 = obj1.handle;
    }

    if (obj2.hasOwnProperty("userData")) {
        handle2 = obj2.userData.physicsBody.userData.handle;
    } else {
        handle2 = obj2.handle;
    }
    if ((handle1 == handle.handle1 && handle2 == handle.handle2) || (handle1 == handle.handle2 && handle2 == handle.handle1)) {
        return true
    }
}

const test2 = (pos, radius, height, quat, visible) => {
    var obj = capsule(pos.x, pos.y, pos.z, radius, height);
    obj.setRotationX(quat.x)
    obj.setRotationY(quat.y)
    obj.setRotationZ(quat.z)
    obj.visible = visible
    var rbInfo = rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z)
    var rb = world.createRigidBody(rbInfo);
    var angle = eulerToQuaternion(quat.x, quat.y, quat.z)
    var rbColliderInfo = rapier.ColliderDesc.capsule(height / 2, radius).setRotation({ w: angle.w, x: angle.x, y: angle.y, z: angle.z }).setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(rapier.ActiveCollisionTypes.DEFAULT | rapier.ActiveCollisionTypes.KINEMATIC_FIXED)
    var rbCollider = world.createCollider(rbColliderInfo, rb);
    obj.userData.physicsBody = rb
    rb.userData = rbCollider

    // functions

    obj.move = (pos) => {
        obj.position.x = pos.x
        obj.position.y = pos.y
        obj.position.z = pos.z
        obj.userData.physicsBody.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })
    }

    return obj
}

const castRay = (origin, dir, maxToi, solid, handle) => {
    var ray = new rapier.Ray({ x: origin.x, y: origin.y, z: origin.z }, { x: dir.x, y: dir.y, z: dir.z });
    //let hit = world.castRay(ray, maxToi, solid, null, null, handle)
    var hit_handle;
    world.intersectionsWithRay(ray, maxToi, solid, (hit) => {
        if (hit.collider.handle != handle) {
            hit_handle = hit.collider.handle
            return false
        } else {
            return true
        }
    });
    if (hit_handle) {
        return hit_handle
    } else {
        return "No hit"
    }
}

const updatePhysics = () => {
    // Step the simulation forward.  
    world.step(eventQueue);
    deltatime = (new Date() - time) / 1000
    time = new Date()

    for (let i = 0; i < rigidBodies.length; i++) {
        let obj = rigidBodies[i];
        let objRapier = rigidBodies[i].userData.physicsBody;
        let position = objRapier.translation();
        let rotation = objRapier.rotation();
        obj.position.set(position.x, position.y, position.z);
        obj.rotation.set(rotation.x, rotation.y, rotation.z);
    }
}

// DEGREES TO QUATERNIONS CONVERTER

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function eulerToQuaternion(alpha, beta, gamma) {
    // Convert Euler angles to radians
    var alphaRad = degreesToRadians(alpha);
    var betaRad = degreesToRadians(beta);
    var gammaRad = degreesToRadians(gamma);

    // Compute quaternion components
    var qx =
        Math.sin(alphaRad / 2) * Math.cos(betaRad / 2) * Math.cos(gammaRad / 2) -
        Math.cos(alphaRad / 2) * Math.sin(betaRad / 2) * Math.sin(gammaRad / 2);
    var qy =
        Math.cos(alphaRad / 2) * Math.sin(betaRad / 2) * Math.cos(gammaRad / 2) +
        Math.sin(alphaRad / 2) * Math.cos(betaRad / 2) * Math.sin(gammaRad / 2);
    var qz =
        Math.cos(alphaRad / 2) * Math.cos(betaRad / 2) * Math.sin(gammaRad / 2) +
        Math.sin(alphaRad / 2) * Math.sin(betaRad / 2) * Math.cos(gammaRad / 2);
    var qw =
        Math.cos(alphaRad / 2) * Math.cos(betaRad / 2) * Math.cos(gammaRad / 2) -
        Math.sin(alphaRad / 2) * Math.sin(betaRad / 2) * Math.sin(gammaRad / 2);

    // Normalize quaternion
    var magnitude = Math.sqrt(qw * qw + qx * qx + qy * qy + qz * qz);
    var qxNormalized = qx / magnitude;
    var qyNormalized = qy / magnitude;
    var qzNormalized = qz / magnitude;
    var qwNormalized = qw / magnitude;

    // Return the quaternion as an object
    return {
        x: qxNormalized,
        y: qyNormalized,
        z: qzNormalized,
        w: qwNormalized,
    };
}