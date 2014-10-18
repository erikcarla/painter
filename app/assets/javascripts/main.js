(function(){
	window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
    })();

    var socket = new WebSocket("ws://" + location.host + "/stream");
    var connected = false;
    var players = [];
    socket.onopen = function () { connected = true }
    socket.onclose = function () { connected = false }
    socket.onmessage = function (e) {
    	var m =  JSON.parse(e.data);

    	var player = players[m.pid];
    	if (player === undefined) {
    		player = m;
    	}

    	if (!m.press) {
	    	ctx.beginPath();
			ctx.strokeStyle = m.color;
			ctx.lineWidth = m.size;
			ctx.moveTo(player.x, player.y);
			ctx.lineTo(m.x, m.y);
			ctx.stroke();
		}

    	players[m.pid] = m;
    	// socket.send ()
    }

	var canvas = document.getElementById("draws");
	var ctx = canvas.getContext("2d");
	var pressed = false;

	var COLORS = ["red", "blue", "yellow", "green", "white"];
	var SIZES = [2, 5, 8, 10, 14];

	var color = COLORS[0];
	var size = 5;


  function download() {
    var dt = canvas.toDataURL();
    var as = document.getElementById("save");
    as.href = dt;
  }

  var saveButton = document.getElementById("save");
  saveButton.addEventListener('click', download, false);

  var imageLoader = document.getElementById("load");
  imageLoader.addEventListener('change', handleImage, false);

  function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            var viewport = document.getElementById("viewport");
          
            ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

	function send (o) {
		o.size = size;
		o.color = color;
		if (connected) {
			socket.send( JSON.stringify(o) );
		}
	}

	function positionWithE (e) {
		var o = $(canvas).offset();
		return { x: e.clientX-o.left, y: e.clientY-o.top };
	}

	function onMouseDown (e) {
		var p = positionWithE(e);
		pressed = true;
		p.press = true;
		send(p);
	}

	function onMouseUp (e) {
		var p = positionWithE(e);
		pressed = false;	
		send(p);
	}

	function onMouseMove (e) {
		var p = positionWithE(e);
		if (pressed) {
			send(p);
		}
	}

	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	canvas.addEventListener("mousedown", onMouseDown);
	canvas.addEventListener("mouseup", onMouseUp);
	canvas.addEventListener("mousemove", onMouseMove);

	(function() {
		var canvas = document.getElementById("controls");
		var ctx = canvas.getContext("2d");
		var dirty = true;

		var BUTTON = 40;
		var RADIUS = 10;
		var SELECT = 4;


	function getParam( name )
	{
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexS = "[\\?&]"+name+"=([^&#]*)";
	  var regex = new RegExp( regexS );
	  var results = regex.exec( window.location.href );
	  if( results == null )
	    return "";
	  else
	    return results[1];
	}
	
	var username = getParam("username");
	var parent = document.getElementById("username");
  	var newContent = document.createTextNode(" " + username);

  	parent.appendChild(newContent);

		canvas.addEventListener("click", function (e) {
			var p = positionWithE(e);
			var i = Math.floor(p.x / BUTTON);
			if (i < COLORS.length) {
				color = COLORS[i];
			} else {
				i -= COLORS.length;
				if (i < SIZES.length) {
					size = SIZES[i];
				}
			}
			dirty = true;
		});

		function render () {
			if (!dirty) return;
			dirty = false;
			var w = canvas.width, h = canvas.height;
			var x, y, radius;

			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, w, h);

			//draw colors

			x = BUTTON/2, y = h/2, radius = RADIUS;
			COLORS.forEach(function(c) {
				ctx.fillStyle = c;
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, 2*Math.PI);
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = 'rgba(0,0,0,0.5)';
				ctx.stroke();
				if (c == color) {
					ctx.lineWidth = 2;
					ctx.strokeStyle = 'black';
					ctx.beginPath();
					ctx.arc(x, y, radius+SELECT, 0, 2*Math.PI);
					ctx.stroke();
				}
				x += BUTTON;
			});

			//draw size
			ctx.fillStyle = 'black';
			SIZES.forEach(function(s) {
			  ctx.beginPath();
			  ctx.arc(x, y, s, 0, 2*Math.PI);
			  ctx.fill();
			  ctx.lineWidth= 1;
			  if (s == size) {
			    ctx.lineWidth = 2;
			    ctx.strokeStyle = 'black';
			    ctx.beginPath();
			    ctx.arc(x, y, s+SELECT, 0, 2*Math.PI);
			    ctx.stroke();
			  }
			  x += BUTTON;
			});

		}

		requestAnimFrame(function loop() {
			requestAnimFrame(loop);
			render();
		}, canvas);

	}());
}());