if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, controls, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;

var objects = [];

var color =  0xff0000;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 500, 800, 1300 );
	camera.lookAt( new THREE.Vector3() );

	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();

	// roll-over helpers / ghost cube 
	makeGhost(color);
	

	// cubes

	cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
	

	// grid

	var size = 500, step = 50;

	var geometry = new THREE.Geometry();

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

		geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
		geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

	}

	var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

	var line = new THREE.LineSegments( geometry, material );
	scene.add( line );
	line.name = 'thelines';


	raycaster = new THREE.Raycaster();
	onMouseDownPosition = new THREE.Vector2();
	onMouseUpPosition = new THREE.Vector2();
	onGhostMove = new THREE.Vector2();

	var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
	geometry.rotateX( - Math.PI / 2 );

	plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
	scene.add( plane );
	plane.name = 'theplane';

	objects.push( plane );

	// Lights

	var ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );


	//
	window.addEventListener( 'resize', onWindowResize, false );

}

function makeGhost(color) {
	scene.remove( rollOverMesh );
	rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
	rollOverMaterial = new THREE.MeshBasicMaterial( { color: color, opacity: 0.5, transparent: true } );
	rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
	scene.add( rollOverMesh );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	onMouseDownPosition.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );


	isMouseDown = true;

	render();

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	onGhostMove.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	raycaster.setFromCamera( onGhostMove, camera );

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		var intersect = intersects[ 0 ];

		rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
		rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

	}

	render();

}

function onDocumentMouseUp (event) {

	event.preventDefault();

	isMouseDown = false;

	onMouseUpPosition.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

	if( onMouseDownPosition.distanceTo( onMouseUpPosition ) > 0.00001 ){ return; }

	raycaster.setFromCamera( onMouseUpPosition, camera );

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		var intersect = intersects[ 0 ];

		// delete cube

		if ( isShiftDown ) {

			if ( intersect.object != plane ) {

				scene.remove( intersect.object );

				objects.splice( objects.indexOf( intersect.object ), 1 );

			}

		// create cube

		} else {
			

			cubeMaterial = new THREE.MeshLambertMaterial( { color: color} );
			var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
			voxel.position.copy( intersect.point ).add( intersect.face.normal );
			voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
			
			if (voxel.position.y > 0) {
				scene.add( voxel );
				objects.push( voxel );
			}		

		}

		render();

	}
}

function onDocumentKeyDown( event ) {

	switch( event.keyCode ) {

		case 16: 
		isShiftDown = true; 
		break; 
		// colors 
		case 71: //g
		case 86: //v
		color = 0x2ecc71; //green or verte
		makeGhost(color);
		break; 
		case 82: //r 
		color = 0xff0000; // red or rouge
		makeGhost(color);
		break; 
		case 87: //w
		case 76: //w
		color = 0xffffff // white or blanc
		makeGhost(color);
		break; 
		case 89: //y
		case 74: //j
		color = 0xf1c40f // yellow or jaune
		makeGhost(color);
		break; 
		case 66: //b 
		color = 0x3498db // blue or bleu
		makeGhost(color);
		break; 
		case 80: //p
		case 77: //m 
		color = 0x9b59b6 // purple or mauve
		makeGhost(color);
		break; 
		case 75: //k
		case 78: //n
		color = 0x000000 //black or noir
		makeGhost(color);
		break;

	}

}

function onDocumentKeyUp( event ) {

	switch ( event.keyCode ) {

		case 16: isShiftDown = false; render(); break;

	}

}

function animate() {

  requestAnimationFrame( animate );
  controls.update();

}

function render() {

	renderer.render( scene, camera );

}


function download() {

	scene.remove( rollOverMesh );
	scene.rotation.x = THREE.Math.degToRad(90);
	scene.scale.set(0.2,0.2,0.2);
	scene.updateMatrixWorld(); 

	saveSTL(scene, 'model');

	scene.scale.set(1,1,1);
	scene.rotation.x = 0;
	scene.add( rollOverMesh );
}


