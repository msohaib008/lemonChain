import React, { useEffect, createContext, useContext, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid,Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { TextureLoader, Vector3, Raycaster } from 'three';
import * as THREE from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

const ENVIRONMENT_GLB_PATH = `/Environment.glb`;
const TREES_GLB_PATH = `/New_trees.glb`;
const TEXTURE_PATH = `/Textures/`;

const CameraContext = createContext();

const BOUNDARY = {
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10
};

const ThreeScene = () => {
    const [environment, setEnvironment] = useState(null);
    const [trees, setTrees] = useState(null);
    const textureLoader = new TextureLoader();
    const [treeMeshes, setTreeMeshes] = useState([]); // New state to store tree meshes
    const cameraRef = useRef();
    // Load textures and models
    useEffect(() => {
        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);

        const loadTextures = () => ({
            grass: textureLoader.load(`${TEXTURE_PATH}grass_color.png`),
            bark: textureLoader.load(`${TEXTURE_PATH}bark_color.png`),
            foliage: textureLoader.load(`${TEXTURE_PATH}foliage_color-foliage_opacity.png`),
            leaves: textureLoader.load(`${TEXTURE_PATH}1234.png`),
            bricksColor: textureLoader.load(`${TEXTURE_PATH}Bricks_color.png`),
            bricksNormal: textureLoader.load(`${TEXTURE_PATH}Bricks_normal.png`),
            trackColor: textureLoader.load(`${TEXTURE_PATH}track_color.jpg`),
            tracksNormal: textureLoader.load(`${TEXTURE_PATH}tacks_normal.jpg`),
            trackRough: textureLoader.load(`${TEXTURE_PATH}track_rough.jpg`),
            foliageColor: textureLoader.load(`${TEXTURE_PATH}foliage_color-foliage_opacity.png`),
            foliageAlpha: textureLoader.load(`${TEXTURE_PATH}Foliage_Alpha.png`),
            foliageNormal: textureLoader.load(`${TEXTURE_PATH}foliage_normal.png`),
            foliageRough: textureLoader.load(`${TEXTURE_PATH}foliage_roughness@channels=G.png`),
            wallNormal: textureLoader.load(`${TEXTURE_PATH}tiglchydy_2K_Normal.jpg`),
            wallRough: textureLoader.load(`${TEXTURE_PATH}tiglchydy_2K_Roughness.jpg`),
            doorColor: textureLoader.load(`${TEXTURE_PATH}istockphoto-173201523-612x612.jpg`),
            solar: textureLoader.load(`${TEXTURE_PATH}istockphoto-185692745-612x612.jpg`),
            roof: textureLoader.load(`${TEXTURE_PATH}tfrneges_2K_Albedo.jpg`),
            roofNormal: textureLoader.load(`${TEXTURE_PATH}tfrneges_2K_Normal.jpg`),
            roofRough: textureLoader.load(`${TEXTURE_PATH}tfrneges_2K_Roughness.jpg`),
            oldHouse: textureLoader.load(`${TEXTURE_PATH}house-old-photo-texture-of-building_640v640.jpg`),
            oldRock: textureLoader.load(`${TEXTURE_PATH}old-rock-wall-texture-1619999.jpg`),
            locomotive: textureLoader.load(`${TEXTURE_PATH}locomotive_diffuse.png`),
            grama: textureLoader.load(`${TEXTURE_PATH}Grama_Albedo.png`),
            gramaNormal: textureLoader.load(`${TEXTURE_PATH}Grama_Normal.png`),
            gramaRough: textureLoader.load(`${TEXTURE_PATH}Grama_Roughness.png`),
            path: textureLoader.load(`${TEXTURE_PATH}vkvnfa2_2K_Albedo.jpg`),
            lemon: textureLoader.load(`${TEXTURE_PATH}textureLemon_Tree.png`),
            terra: textureLoader.load(`${TEXTURE_PATH}vkvnfa2_2K_Albedo.jpg`),
            terraNormal: textureLoader.load(`${TEXTURE_PATH}Terra_Normal.png`),
            terraRough: textureLoader.load(`${TEXTURE_PATH}Terra_Rough.png`),

        });

        const applyTextures = (object, textures) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    // console.log({ meshName: child.material.name })
                    if (child.material.name === 'bark') {
                        child.material.map = textures.bark;
                    } else if (child.material.name === 'foliage') {
                        child.material.map = textures.foliage;
                        child.material.color.set(0xFFFFFF);
                    }
                    else if (child.material.name === "Material.011") {
                        child.material.map = textures.bricksColor;
                        child.material.normalMap = textures.bricksNormal;
                    }
                    else if (child.material.name === "Material.004") {
                        child.material.map = textures.trackColor; // Set the color texture
                        child.material.normalMap = textures.tracksNormal; // Set the normal map
                        child.material.roughnessMap = textures.trackRough; // Set the roughness map
                        child.material.color.set(0xFFFFFF); // This helps avoid tinting from the color texture
                        child.material.transparent = true; // Enable transparency if needed
                        child.material.needsUpdate = true;
                    }
                    else if (child.material.name === "Material.005") {
                        child.material.color.set(0x808080); // This helps avoid tinting from the color texture
                    }
                    else if (child.material.name === "leaves") {
                        child.material.map = textures.foliageColor;         // Set color texture
                        child.material.alphaMap = textures.foliageAlpha;    // Set alpha texture
                        child.material.normalMap = textures.foliageNormal;   // Set normal map
                        child.material.roughnessMap = textures.foliageRough;
                        child.material.color.set(0x78866B); // This helps avoid tinting from the color texture
                    }
                    else if (child.material.name === 'NewTree_Plane2') {
                        // console.log({ tree: child })
                        child.material.map = textures.lemon;
                        // child.material.map = null;

                        // Set the color (e.g., red for testing)
                        // child.material.color.set(0xff0000);
                    
                        // Reset emissive color to black
                        child.material.emissive.set(0x072406);
                    
                        // Adjust material properties
                        child.material.metalness = 0;
                        child.material.roughness = 0;
                        child.material.transparent = true; // Disable transparency for testing
                        child.material.alphaTest = 0.8; // Disable alpha testing
                        // child.material.alphaMap = textures.lemon;
                        // Force the material to update
                        child.material.needsUpdate = true;
                    }
                    else if (child.material.name === "Material.007") {
                        child.material.map = textures.oldHouse
                    }
                    else if (child.material.name === "istockphoto-173201523-612x612") {
                        child.material.map = textures.doorColor;
                        child.material.color.set(0xFFFF00);
                    }
                    else if (child.material.name === "Solar") {
                        child.material.map = textures.solar
                    }
                    else if (child.material.name === "Red_Roof_tfrneges.002") {
                        child.material.map = textures.roof; // Set the color texture
                        child.material.normalMap = textures.roofNormalNormal; // Set the normal map
                        child.material.roughnessMap = textures.roofRough;
                    }

                    else if (child.material.name === "Material.017") {
                        child.material.map = textures.wallNormal;         // Set color texture
                        child.material.normalMap = textures.wallNormal;   // Set normal map
                        child.material.roughnessMap = textures.wallRough;// Set default color for untextured parts
                    }
                    else if (child.material.name === "Material.010") {// Set default color for untextured parts
                        child.material.map = textures.oldRock
                    }
                    else if (child.material.name === "Material.012") {// Set default color for untextured parts
                        child.material.map = textures.doorColor;
                        child.material.color.set(0x573D2C);
                    }
                    else if (child.material.name === "Material.011") {// Set default color for untextured parts
                        // child.material.map = textures.doorColor;
                        child.material.color.set(0xFFFF00);
                    }
                    else if (child.material.name === "Material.013") {// Set default color for untextured parts
                        child.material.map = textures.oldRock
                    }
                    else if (child.material.name === "Material.019") {
                        child.material.map = textures.locomotive
                    }
                    else if (child.material.name === "vagon.001") {
                    }
                    else if (child.material.name === "Grama") {
                        child.material.map = textures.grama; // Set the color texture
                        child.material.normalMap = textures.gramaNormal; // Set the normal map
                        child.material.roughnessMap = textures.gramaRough; // Set the roughness map
                        // console.log({ grama: child })
                        child.material.vertexColors = false;
                        // child.material.combine = THREE.MixOperation,
                        child.material.color.set(0xe8d2b3);

                        child.material.transparent = true;
                        child.material.needsUpdate = true;
                        child.material.map.wrapS = THREE.RepeatWrapping;
                        child.material.map.wrapT = THREE.RepeatWrapping;
                        child.material.map.repeat.set(1, -1); // Flipping vertically

                        child.material.needsUpdate = true; // Ensure the material updates

                    }
                    else if (child.material.name === "Terra") {
                        child.material.map = textures.terra; // Set the color texture
                        child.material.normalMap = textures.terraNormal; // Set the normal map
                        child.material.roughnessMap = textures.terraRough;
                        child.material.color.set(0xcea169);
                    }

                    else if (child.material.name === "fbecdf28f52f33b7b10907efd41571db") {
                        child.material.map = textures.doorColor;
                    }
                    else {
                        child.material.color.set(0x228B22); // Set default color for untextured parts
                    }
                }
            });
        };

        const textures = loadTextures();

        gltfLoader.load(ENVIRONMENT_GLB_PATH, (gltf) => {
            const envObject = gltf.scene;
            envObject.scale.set(0.0005, 0.0005, 0.0005);
            envObject.position.set(0, -15.5, 0); // Adjust Y and possibly other axes to center on zero.
            envObject.rotation.y = Math.PI / 4; // Rotate 45 degrees around the Y-axis

            applyTextures(envObject, textures);
            setEnvironment(envObject);
        });

        gltfLoader.load(TREES_GLB_PATH, (gltf) => {
            const treesObject = gltf.scene;
            treesObject.scale.set(0.0005, 0.0005, 0.0005);
            treesObject.position.set(0, -15.5, 0); // Adjust Y and possibly other axes to center on zero.
            applyTextures(treesObject, textures);
            setTrees(treesObject);
            treesObject.rotation.y = 7.06;
            // treesObject.rotation.x = Math.PI / 2; // Rotates 90 degrees around the X-axis
            // treesObject.rotation.z = Math.PI / 2; // Rotates 90 degrees around the Z-axis

            // const meshes = [];
            // treesObject.traverse((child) => {
            //     if (child.isMesh) {
            //         meshes.push(child); // Collect tree meshes
            //     }
            // });
            // setTreeMeshes(meshes);


        });

        return () => {
            dracoLoader.dispose();
        };
    }, []);

    return (
        <>
        <Canvas
            style={{ width: '100vw', height: '100vh' }}
            camera={{ position: [0, 2, 10], fov: 50 }}
            gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
        >
            <ambientLight intensity={1} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            <FirstPersonWithRaycast hoverHeight={0.3}cameraRef={cameraRef} />
            {environment && <primitive object={environment} />}
            {trees && <primitive object={trees} />}
        </Canvas>
        <ArrowControls cameraRef={cameraRef} />
    </>
    );
};

// FirstPerson Controls Component with Arrow Controls
// FirstPerson Controls Component
// FirstPerson Controls Component
// FirstPerson Controls Component
// FirstPerson Controls Component
const FirstPersonWithRaycast = ({ hoverHeight, cameraRef }) => {
    const { camera, gl, scene } = useThree();
    const controls = useRef();
    const raycaster = useRef(new Raycaster());
    const downVector = new Vector3(0, -1, 0);

    useEffect(() => {
        cameraRef.current = camera
        controls.current = new FirstPersonControls(camera, gl.domElement);

        // Adjust movement and look speed for smooth controls
        controls.current.movementSpeed = 1; // Lowered for smoother movement
        controls.current.lookSpeed = 0.05;  // Lowered to reduce rotation sensitivity

        // Additional settings for damping and finer control
        controls.current.lookVertical = true;       // Allows vertical rotation
        controls.current.constrainVertical = true;   // Constrain vertical rotation
        controls.current.verticalMin = Math.PI / 2.5;  // Constrain upward pitch
        controls.current.verticalMax = Math.PI / 1.5; // Constrain downward pitch
    }, [camera, gl]);

    useFrame((_, delta) => {
        // Update first-person controls
        controls.current?.update(delta);

        // Set up raycaster from the camera position downwards
        raycaster.current.set(camera.position, downVector);
        const intersects = raycaster.current.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const groundY = intersects[0].point.y;
            camera.position.y = groundY + hoverHeight; // Maintain a hover height
        }
    });

    useFrame((_, delta) => {
        const scaledDelta = delta * 0.5; // Scaling down delta for smoother frame updates
        controls.current?.update(scaledDelta);
    });

    return null;
};


// Arrow Controls Component for HTML Buttons
const ArrowControls = ({ cameraRef }) => {
    const moveCamera = (direction) => {
        const moveDistance = 0.5; // Adjust as needed
        if (!cameraRef.current) return; // Ensure camera is defined
        switch (direction) {
            case 'forward':
                cameraRef.current.position.z -= moveDistance;
                break;
            case 'backward':
                cameraRef.current.position.z += moveDistance;
                break;
            case 'left':
                cameraRef.current.position.x -= moveDistance;
                break;
            case 'right':
                cameraRef.current.position.x += moveDistance;
                break;
            default:
                break;
        }
    };

    return (
        <div style={styles.arrowContainer}>
            <button style={styles.arrowButton} onClick={() => moveCamera('forward')}>↑</button>
            <div style={styles.horizontalContainer}>
                <button style={styles.arrowButton} onClick={() => moveCamera('left')}>←</button>
                <button style={styles.arrowButton} onClick={() => moveCamera('right')}>→</button>
            </div>
            <button style={styles.arrowButton} onClick={() => moveCamera('backward')}>↓</button>
        </div>
    );
};
const styles = {
    arrowContainer: {
        position: 'fixed', // Fixed positioning
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1000, // Ensure buttons are on top
    },
    horizontalContainer: {
        display: 'flex',
    },
    arrowButton: {
        background: 'rgba(255, 255, 255, 0.7)',
        border: 'none',
        borderRadius: '5px',
        padding: '10px',
        margin: '5px',
        cursor: 'pointer',
        fontSize: '20px',
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
    },
};



// Control Panel with Arrow Buttons



export default ThreeScene;
