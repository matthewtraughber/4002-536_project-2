// GLOBAL VARIABLE INITIALIZATION
var http;
var isWorking;
var data;
var format = "json";
var fadeDuration = 1000;
var fadeStages = 20;
var defConfig = true;
var svgNS = "http://www.w3.org/2000/svg";
var xlinkNS = "http://www.w3.org/1999/xlink";


// *****************************************************************************
// Constructor function
// *****************************************************************************
function init() {
	// Assigns global HTTP object
	http = getHTTPObject();

	// Assigns global flag to pause HTTP requests
	isWorking = false;
	
	// Detects if definitions have been already configured
	if (defConfig) {
		// Function call to create drop shadow filter definition
		createDropShadow();
		defConfig = false;
	}

	// Function call to load the data
	loadData();
}


// *****************************************************************************
// Function to create a XMLHttpRequest object
// *****************************************************************************
function getHTTPObject() {
	var xmlhttp;

	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}

	// branch for IE/Windows ActiveX version
	else if (window.ActiveXObject) {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		return false;
	}

	return xmlhttp;
}


// *****************************************************************************
// Function to load data
// *****************************************************************************
function loadData() {
	// Detect if HTTP object exists and is not busy
	if (http && !isWorking) {
		// Tries to get live data, else defaults to a local data source
		if (location.hostname == "people.rit.edu") {
			// Opens local PHP proxy to get data
			http.open('get', 'http://people.rit.edu/met8481/536/project_2/proxy/flickrProxy.php?format=' + format);
		} else {
			// Opens local data source as a manual work around (for testing)
			http.open('get', 'http://127.0.0.1/proj2/data/flickr.json');
		}

		http.onreadystatechange = handleHttpResponse;
		http.send();
		isWorking = true;

		// NOT USED - MAKES APPLICATION TOO LAGGY
		// Pulls new data every 30 seconds
		//setTimeout(loadData, 30000);
	}
}


// *****************************************************************************
// Function to verify data
// *****************************************************************************
function handleHttpResponse() {
	// Check HTTP ready state, to verify transfer is complete
	if (http.readyState == 4) {
		// Check status code of HTTP - verify OK
		if (http.status == 200) {
			// Grabs the length of the response text
			var responseTextLength = http.responseText.length;

			// Removes the invalid JSON formatting from Flickr
			formattedJSON = http.responseText.slice(15, responseTextLength - 1);

			// Detects if any invalid JSON is sent from Flicker - if so, try again by calling init()
			try {
				// Parses JSON data - assigns to global data variable
				data = JSON.parse(formattedJSON);
			} catch (e) {
				// console.log(e);
				
				// Tries again for data
				init();
				
				return false;
			}

			// Fades out loading message / in more button
			for (i = 0; i <= 1; i += (1 / fadeStages)) {
				setTimeout("setOpacity(" + (1 - i) + ")", i * fadeDuration);
			}
			
			// Call the main function to display data
			startStream(data);

			isWorking = false;
		}
	}
}


// *****************************************************************************
// Function to fade out loading message / in more button
// *****************************************************************************
function setOpacity(level) {
	document.getElementById('loading').style.opacity = level;
	document.getElementById('nav').style.opacity = (1 - level);
	
	if (level < .050) {
		document.getElementById('loading').style.display = 'none';
	}
}


// *****************************************************************************
// Function to start photo stream
// *****************************************************************************
function startStream(data) {
	// Function call to create polaroids
	createPolaroids(data);
}
  

// *****************************************************************************
// Function to operate on data
// *****************************************************************************
function createPolaroids() {
	// Initial counter for polaroid objects
	var polaroidCount = 0;

	// Gets list of items
	var items = data['items'];
	
	// Loops through items to create displayed content
	for (item in items) {
	//for (var item = 0; item < 2; item++) {
		if (polaroidCount < 20) {
			// Assigns variables to item specifics
			var image = items[item]['media']['m'];
			var url = items[item]['link'];
			var title = items[item]['title'];
			var dateTaken = items[item]['date_taken'];
			var description = items[item]['description'];
			var author = items[item]['author'];
			var authorID = items[item]['author_id'];

			// Parses author to get author name (hardcoded for flickr currently)
			var authorStartIndex = author.lastIndexOf('nobody@flickr.com (') + 19;
			var authorEndIndex = author.lastIndexOf(')');
			var authorName = author.substring(authorStartIndex, authorEndIndex);

			// Parses item description to get thumbnail width (hardcoded for flickr currently)
			var widthStartIndex = description.lastIndexOf('width="') + 7;
			var widthEndIndex = description.lastIndexOf('" height');
			var width = description.substring(widthStartIndex, widthEndIndex);

			// Parses item description to get thumbnail height (hardcoded for flickr currently)
			var heightStartIndex = description.lastIndexOf('height="') + 8;
			var heightEndIndex = description.lastIndexOf('" alt');
			var height = description.substring(heightStartIndex, heightEndIndex);                 
			
			// Detects if author name is too long
			if (authorName.length > (width / 18)) {
				authorName = authorName.substring(0, (width / 18)) + "...";
			}
			
			// Detects if title is too long
			if (title.length > (width / 14)) {
				title = title.substring(0, (width / 14)) + "...";
			}
			
			// Gets window center coordinates to place polaroid	
			var polaroidX = Math.floor((window.innerWidth / 2) - (parseInt(width) / 2));
			var polaroidY = Math.floor((window.innerHeight / 2) - (parseInt(height) / 2));
			
			// -------------------------------------------------------
			// CREATION OF SVG ELEMENTS ------------------------------
			// Creates a group to hold each polaroid's relevant data
			var polaroidGroup = document.createElementNS(svgNS, 'g');		
			polaroidGroup.setAttributeNS(null, 'class', "polaroidGroup");
			polaroidGroup.setAttributeNS(null, 'transform', "rotate(" + 180 + ")" + " " + "translate(" + 1 + "," + 1 + ")");
			polaroidGroup.setAttributeNS(null, 'width', parseInt(width) + 'px');
			polaroidGroup.setAttributeNS(null, 'height', parseInt(height) + 'px');
			polaroidGroup.setAttributeNS(null, 'fill', '#ECEEE1');
			polaroidGroup.setAttributeNS(null, 'stroke', '#000');
			polaroidGroup.setAttributeNS(null, 'stroke-width', 0);
			polaroidGroup.setAttributeNS(null, 'id', authorID + dateTaken);
			polaroidGroup.setAttributeNS(null, "onmousedown","catchMove('" + authorID + dateTaken + "')");
			polaroidGroup.setAttributeNS(null, "onmouseup","stopMove('" + authorID + dateTaken + "')");
				
			// Creates a rectangle to act as the polaroid label / border
			var polaroidLabel = document.createElementNS(svgNS, 'rect');
			polaroidLabel.setAttributeNS(null, 'class', "polaroidLabel");
			polaroidLabel.setAttributeNS(null, 'x', 0);
			polaroidLabel.setAttributeNS(null, 'y', 0);
			polaroidLabel.setAttributeNS(null, 'width', parseInt(width) + 40 + 'px');
			polaroidLabel.setAttributeNS(null, 'height', parseInt(height) + 70 + 'px');
			polaroidLabel.setAttributeNS(null, 'fill', '#ECEEE1');
			polaroidLabel.setAttributeNS(null, 'stroke', '#000');
			polaroidLabel.setAttributeNS(null, 'stroke-width', 0);
			polaroidLabel.setAttributeNS(null, 'filter', 'url(#dropShadow)');

			// Creates rectangle in polaroid group to act as the image border
			var polaroidImageBorder = document.createElementNS(svgNS, 'rect');
			polaroidImageBorder.setAttributeNS(null, 'class', "polaroidImage");
			polaroidImageBorder.setAttributeNS(null, 'x', 20);
			polaroidImageBorder.setAttributeNS(null, 'y', 20);
			polaroidImageBorder.setAttributeNS(null, 'width', parseInt(width) + 'px');
			polaroidImageBorder.setAttributeNS(null, 'height', parseInt(height) + 'px');
			polaroidImageBorder.setAttributeNS(null, 'fill', '#000');
			polaroidImageBorder.setAttributeNS(null, 'stroke', '#000');
			polaroidImageBorder.setAttributeNS(null, 'stroke-width', 2);
			
			// Creates image (from data) to append to pattern (for polaroid image background)
			var polaroidImage = document.createElementNS(svgNS, 'image');
			polaroidImage.setAttributeNS(null, 'class', "polaroidImage");
			polaroidImage.setAttributeNS(null, 'x', 20);
			polaroidImage.setAttributeNS(null, 'y', 20);
			polaroidImage.setAttributeNS(null, 'width', parseInt(width) + 'px');
			polaroidImage.setAttributeNS(null, 'height', parseInt(height) + 'px');
			polaroidImage.setAttributeNS(null, 'pointer-events', 'none');
			polaroidImage.setAttributeNS(xlinkNS, 'xlink:href', image);

			// Creates link to image source
			var linkTag = document.createElementNS(svgNS, 'a');
			linkTag.setAttributeNS(xlinkNS, 'xlink:href', url);
			linkTag.setAttributeNS(null, 'target', '_blank');
			linkTag.setAttributeNS(null, 'class', 'polaroidLink');

			// Creates text tag to hold image source tspans
			var linkText = document.createElementNS(svgNS, 'text');
			linkText.setAttributeNS(null, 'font-family', 'monospace');
			linkText.setAttributeNS(null, 'font-size', .75 + 'em');
			linkText.setAttributeNS(null, 'fill', '#000');
			linkText.setAttributeNS(null, 'lengthAdjust', 'spacing');
			linkText.setAttributeNS(null, 'textLength', parseInt(width));
			linkText.setAttributeNS(null, 'x', 10);
			linkText.setAttributeNS(null, 'y', (parseInt(height) + 40));

			// Creates tspan to hold title text for image source
			var linkTextTitle = document.createElementNS(svgNS, 'tspan');
			
			// Adds relevant text to the title's tspan
			linkTextTitle.appendChild(document.createTextNode(title));
			
			// Creates tspan to hold author name text for image source
			var linkTextAuthorName = document.createElementNS(svgNS, 'tspan');
			linkTextAuthorName.setAttributeNS(null, 'fill', '#BCB19B');
			linkTextAuthorName.setAttributeNS(null, 'dy', 15);
			
			// Adds relevant text to the author's name tspan
			linkTextAuthorName.appendChild(document.createTextNode(" by " + authorName));
			
			// -----------------------------------------------------------
			// PLACING SVG ELEMENTS ON PAGE ------------------------------
			// Appends the image to the polaroid 'object'
			polaroidGroup.appendChild(polaroidLabel);
			polaroidGroup.appendChild(polaroidImageBorder);
			
			// Appends the image to the polaroid 'object'
			polaroidGroup.appendChild(polaroidImage);
			
			// Appends the tspans to the text tag
			linkText.appendChild(linkTextTitle);
			linkText.appendChild(linkTextAuthorName);

			// Appends the text tag to the link tag
			linkTag.appendChild(linkText);

			// Appends the link / item text to the polaroid 'object'
			polaroidGroup.appendChild(linkTag);
			
			// Appends the polaroid 'object' to the page
			document.getElementById('polaroids').appendChild(polaroidGroup);
			
			// Rotates the polaroid object into view
			rotateAnimation((authorID + dateTaken),  0, (Math.random() * 360));
			
			polaroidCount++;
		}
	}	
}


// *****************************************************************************
// Function to create animation definitions
// *****************************************************************************
function rotateAnimation(id, from, to) {
	var polaroidGroupRotate = document.createElementNS(svgNS, 'animateTransform');	
	polaroidGroupRotate.setAttributeNS(null, 'id', 'polaroidGroupRotate');
	polaroidGroupRotate.setAttributeNS(null, 'attributeName', 'transform');
	polaroidGroupRotate.setAttributeNS(null, 'type', 'rotate');
	polaroidGroupRotate.setAttributeNS(null, 'from', from);
	polaroidGroupRotate.setAttributeNS(null, 'to', to);
	polaroidGroupRotate.setAttributeNS(null, 'dur', '5s');
	polaroidGroupRotate.setAttributeNS(null, 'begin', '1s');
	polaroidGroupRotate.setAttributeNS(null, 'fill', 'freeze');
	polaroidGroupRotate.setAttributeNS(null, 'additive', 'sum');
	document.getElementById(id).appendChild(polaroidGroupRotate);
}


// *****************************************************************************
// Function to create drop shadow filter
// *****************************************************************************
function createDropShadow() {
		var dropShadowFilter = document.createElementNS(svgNS, 'filter');	
		dropShadowFilter.setAttributeNS(null, 'id', "dropShadow");
		document.getElementById('filters').appendChild(dropShadowFilter);
		
		var dropShadowFEOffset = document.createElementNS(svgNS, 'feOffset');
		dropShadowFEOffset.setAttributeNS(null, 'in', "SourceAlpha");
		dropShadowFEOffset.setAttributeNS(null, 'result', "Shadow");
		dropShadowFEOffset.setAttributeNS(null, 'dx', "0");
		dropShadowFEOffset.setAttributeNS(null, 'dy', "1");
		dropShadowFilter.appendChild(dropShadowFEOffset);
		
		var dropShadowFEColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
		dropShadowFEColorMatrix.setAttributeNS(null, 'in', "Shadow");
		dropShadowFEColorMatrix.setAttributeNS(null, 'result', "FadeShadow");
		dropShadowFEColorMatrix.setAttributeNS(null, 'type', "matrix");
		dropShadowFEColorMatrix.setAttributeNS(null, 'values', "0.5 0 0 0 0 0 0.5 0 0 0 0 0 0.5 0 0 0 0 0 0.5 0");
		dropShadowFilter.appendChild(dropShadowFEColorMatrix);	

		var dropShadowFEGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
		dropShadowFEGaussianBlur.setAttributeNS(null, 'in', "FadeShadow");
		dropShadowFEGaussianBlur.setAttributeNS(null, 'result', "BlurShadow");
		dropShadowFEGaussianBlur.setAttributeNS(null, 'stdDeviation', "3");
		dropShadowFilter.appendChild(dropShadowFEGaussianBlur);		
		
		var dropShadowFEBlend = document.createElementNS(svgNS, 'feBlend');
		dropShadowFEBlend.setAttributeNS(null, 'in', "SourceGraphic");
		dropShadowFEBlend.setAttributeNS(null, 'in2', "BlurShadow");
		dropShadowFEBlend.setAttributeNS(null, 'mode', "normal");
		dropShadowFilter.appendChild(dropShadowFEBlend);		
}


// *****************************************************************************
// Function to clear slate
// *****************************************************************************
function clearSlate() {
	var visiblePolaroids = document.getElementById('polaroids');

	while (visiblePolaroids.hasChildNodes()) {
		visiblePolaroids.removeChild(visiblePolaroids.lastChild);
	}
}


// *****************************************************************************
// Function to detect when a polaroid is selected to move
// *****************************************************************************
function catchMove(id) {
	// Gets the child objects of the polaroid group
	var  polaroidObjects = document.getElementById(id).childNodes;

	// Gets current transform matrix for polaroid object
	var tests = document.getElementById(id).getCTM();
	
	// Radians converted to degrees
	var rad2Deg = 180 / Math.PI;
	
	// Gets current rotated angle of polaroid object
	var rotation = Math.atan2( tests.b, tests.a ) * rad2Deg;
	
	// Rotates polaroid object to be 'right-side up'
	rotateAnimation(id, rotation, (360 - rotation));
	
	// Loops through the polaroid group objects, and applies the onmousemove event
	for (var i = 0, len = polaroidObjects.length; i < len; i++) {
		var polaroidObject = polaroidObjects[i];
		
		polaroidObject.setAttributeNS(null, "onmousemove","startMove(evt,'" + id + "')");
	}
}


// *****************************************************************************
// Function to drag polaroid
// *****************************************************************************
function startMove(evt, id) { 
	// Gets the child objects of the polaroid group
	var  polaroidObjects = document.getElementById(id).childNodes;
	
	// Loops through the polaroid group objects, and detects when a specific one is selected
	for (var i = 0, len = polaroidObjects.length; i < len; i++) {
		var polaroidObject = polaroidObjects[i];
		
		if (polaroidObject.className != undefined) {
			// Switch statement to detect specific polaroid components, then moves specific components appropriately
			switch (polaroidObject.className.baseVal) {
				case 'polaroidLabel':
					polaroidObject.setAttributeNS(null,"x", ((evt.clientX) - (polaroidObject.width.baseVal.value / 2))); 
					polaroidObject.setAttributeNS(null,"y", ((evt.clientY) - (polaroidObject.height.baseVal.value / 2))); 
				break;
				
				case 'polaroidImage':
					polaroidObject.setAttributeNS(null,"x", ((evt.clientX) - (polaroidObject.width.baseVal.value / 2))); 
					polaroidObject.setAttributeNS(null,"y", ((evt.clientY) - ((polaroidObject.height.baseVal.value / 2) + 20))); 
				break;
				
				case 'polaroidLink':		
					polaroidObject.childNodes[0].setAttributeNS(null,"x", ((evt.clientX) - ((polaroidObjects[0].width.baseVal.value / 2) - 30))); 
					polaroidObject.childNodes[0].setAttributeNS(null,"y", ((evt.clientY) + ((polaroidObjects[0].height.baseVal.value / 2) - 30))); 
				break;
			}
		}
	}
}


// *****************************************************************************
// Function to stop moving polaroid
// *****************************************************************************
function stopMove(id) {
	// Gets the child objects of the polaroid group
	var  polaroidObjects = document.getElementById(id).childNodes;
	
	// Loops through the polaroid group objects, and removes the onmousemove event
	for (var i = 0, len = polaroidObjects.length; i < len; i++) {
		var polaroidObject = polaroidObjects[i];
		
		polaroidObject.setAttributeNS(null, "onmousemove", null); 
	}
}

