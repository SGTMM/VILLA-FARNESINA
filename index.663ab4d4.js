var camera, clock, scene, renderer;
var moveX = 0;
var moveZ = 0;
var stats;
wait();
function wait() {
    if (typeof THREE === "undefined") requestAnimationFrame(wait);
    else start();
}
var raycaster, pointer;
var right_arrow, left_arrow;
document.addEventListener("DOMContentLoaded", function () {
    right_arrow = document.getElementById("icon1");
    right_arrow.addEventListener("click", goForward);
    left_arrow = document.getElementById("icon2");
    left_arrow.addEventListener("click", goBack);
});
counter = 1079;
var slide;
var skyBox;
var textureArray = [];
function start() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.updateProjectionMatrix();
    camera.position.z -= 0.01;
    camera.fov = 90;
    camera.updateProjectionMatrix();
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false
    });
    renderer.outputEncoding = THREE.SRGBColorSpace;
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    document.body.appendChild(renderer.domElement);
    clock = new THREE.Clock();
    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    var imagePrefix = "preview";
    var directions = [
        "1",
        "3",
        "5",
        "6",
        "2",
        "4"
    ];
    var imageSuffix = ".jpg";
    var skyGeometry = new THREE.BoxGeometry(10, 10, 10);
    var materialArray = [];
    for (var i = 0; i < 6; i++)materialArray.push(new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
        side: THREE.BackSide,
        roughness: 1
    }));
    skyBox = new THREE.Mesh(skyGeometry, materialArray);
    scene.add(skyBox);
    slide = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 3), new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("./Screenshot (" + counter + ").png")
    }));
    slide.position.z = -2;
    scene.add(slide);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);
    // create a global audio source
    const sound = new THREE.Audio(listener);
    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("audio.mp3", function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
    for (var i = 1079; i < 1112; i++)textureArray[i] = new THREE.TextureLoader().load("./Screenshot (" + i + ").png");
    update();
}
function update() {
    delta = clock.getDelta();
    raycaster.setFromCamera(pointer, camera);
    // calculate objects intersecting the picking ray
    /* const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {

        console.log(intersects[i].point)

    } */ renderer.render(scene, camera);
    requestAnimationFrame(update);
}
window.addEventListener("pointermove", onPointerMove);
function onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.x = event.clientX / window.innerWidth * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function goBack() {
    if (counter > 1079) {
        counter--;
        updateTexture();
    }
}
function goForward() {
    if (counter < 1111) {
        counter++;
        updateTexture();
    }
}
function updateTexture() {
    console.log(counter);
    if (counter === 1095) {
        var imagePrefix = "./preview";
        var directions = [
            "1",
            "3",
            "5",
            "6",
            "2",
            "4"
        ];
        var imageSuffix = ".jpg";
        var materialArray = [];
        for (var i = 0; i < 6; i++)materialArray.push(new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide,
            roughness: 1
        }));
        skyBox.material = materialArray;
        slide.position.z = -2;
        slide.position.x = 0;
        slide.rotation.y = 0;
    } else if (counter === 1096 || counter === 1098) {
        var imagePrefix = "./grotta";
        var directions = [
            "1",
            "3",
            "5",
            "6",
            "2",
            "4"
        ];
        var imageSuffix = ".jpg";
        var materialArray = [];
        for (var i = 0; i < 6; i++)materialArray.push(new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide,
            roughness: 1
        }));
        skyBox.material = materialArray;
        slide.position.z = -2;
        slide.position.x = 0;
        slide.rotation.y = 0;
    } else if (counter === 1099 || counter === 1104) {
        var imagePrefix = "./roxane";
        var directions = [
            "1",
            "3",
            "5",
            "6",
            "2",
            "4"
        ];
        var imageSuffix = ".jpg";
        var materialArray = [];
        for (var i = 0; i < 6; i++)materialArray.push(new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide,
            roughness: 1
        }));
        skyBox.material = materialArray;
        slide.position.x = -2;
        slide.position.z = 0.1;
        slide.rotation.y = Math.PI / 2;
    } else if (counter === 1105) {
        var imagePrefix = "./galatea";
        var directions = [
            "1",
            "3",
            "5",
            "6",
            "2",
            "4"
        ];
        var imageSuffix = ".jpg";
        var materialArray = [];
        for (var i = 0; i < 6; i++)materialArray.push(new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide,
            roughness: 1
        }));
        skyBox.material = materialArray;
        slide.position.x = -2;
        slide.position.z = 0.1;
        slide.rotation.y = Math.PI / 2;
    }
    if (slide) {
        var temp_texture = textureArray[counter];
        temp_texture.minFilter = THREE.LinearFilter;
        slide.material = new THREE.MeshBasicMaterial({
            map: temp_texture
        });
    }
}

//# sourceMappingURL=index.663ab4d4.js.map
