// fork getUserMedia for multiple browser versions, for the future
// when more browsers support MediaRecorder

///////////////////////////////////////////////////////////
function getLink(){
fetch(`http://localhost:8086/all`, {
// fetch(`http://nhubrecorder.herokuapp.com/all`, {
                    method: 'GET',
                      headers: new Headers({
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }),
                }).then(function(response){
                   return response.json();
                 }).then(function(res){
                  var tex  = '<ol>'
                  for (var i = res.data.length - 1; i >= 0; i--) {
                   tex = `${tex}<li class="links" ><a target="_blank" href="http://localhost:8086/v/v/?v=${res.data[i]._id}">${res.data[i]._id}</a></li>`
                   //  var servContainer = document.createElement('article');
                   // var servLabel = document.createElement('li');
                   //  console.log(res.data[i]._id)
                   //  servContainer.classList.add('clip');
                   //  var servLink = res.data[i]._id;
                   //  // servLabel.innerHTML = servLink;
                   //  servLabel.innerHTML = "as a"
                   //  servContainer.appendChild(servLabel);
                  }
                  tex =  `${tex}</ol>` 
                  document.getElementById('rec').innerHTML = tex;
                 })
                .catch(function(error){
                    console.log(error + ' This is an error')
                });
};
getLink();
  /////////////////////////////////////////////////////



navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

// set up basic variables for app

var record = document.querySelector('.record');
var stop = document.querySelector('.stop');
var soundClips = document.querySelector('.sound-clips');
var canvas = document.querySelector('.visualizer');

// visualiser setup - create web audio api context and canvas

var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording

if (navigator.getUserMedia) {
   console.log('getUserMedia supported.');
   navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true,
         video: false
      },

      // Success callback
      function(stream) {
      	 var mediaRecorder = new MediaRecorder(stream, {type: 'audio'});

      	 visualize(stream);

      	 record.onclick = function() {
      	 	mediaRecorder.start();
          console.log(mediaRecorder.state);
      	 	console.log("recorder started");
      	 	record.style.background = "red";
      	 	record.style.color = "black";
      	 };

      	 stop.onclick = function() {
      	 	mediaRecorder.stop();
          console.log(mediaRecorder.state);
      	 	console.log("recorder stopped");
      	 	record.style.background = "";
      	 	record.style.color = "";
      	 };
         const guid=()=> {
          const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
          return `${s4() + s4() + s4() + s4()}`;
          //return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
          };
      	 mediaRecorder.ondataavailable = function(e) {
           e.preventDefault();
            e.stopPropagation();
           console.log("data available");
           console.log(e.data);
           var audioObj = e.data;
          // var clipName = prompt('Add name for clip here')
           var clipName = guid();

      	   var clipContainer = document.createElement('article');
      	   var clipLabel = document.createElement('p');
           var audio = document.createElement('audio');
           var deleteButton = document.createElement('button');
           // var sendButton = document.createElement('button');
           var link = document.createElement('p');
           
           clipContainer.classList.add('clip');
           audio.setAttribute('controls', '');
           deleteButton.innerHTML = "Delete";
           // sendButton.innerHTML = 'Send';
           clipLabel.innerHTML = clipName;

           clipContainer.appendChild(audio);
           clipContainer.appendChild(clipLabel);
           
           clipContainer.appendChild(deleteButton);
           // clipContainer.appendChild(sendButton);
           clipContainer.appendChild(link)
           soundClips.appendChild(clipContainer);
           var anme = clipName + '.mp3';
           var audioURL = URL.createObjectURL(e.data);
               var file = new File([audioObj], anme, { type: 'audio/webm' });
              const xhr = new XMLHttpRequest();
              xhr.open('GET', `http://nhubrecorder.herokuapp.com/create?file-name=${anme}&file-type=webm`);
              xhr.onreadystatechange = () => {
                if(xhr.readyState === 4){
                  if(xhr.status === 200){
                    console.log(xhr.responseText);
                    // const response = xhr.responseText;
                    const response = JSON.parse(xhr.responseText);
                    console.log(response.url);
                    uploadFile(file, response.signedRequest, response.url)
                  }
                  else{
                    alert('could not get signed URL');
                  }
                }
              };
              xhr.send();

              function uploadFile(data, signedRequest, url){
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', signedRequest);
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*")
                xhr.onreadystatechange = () => {
                if(xhr.readyState === 4){
                  if(xhr.status === 200){
                   console.log('Completed');
                     uploadLink(url)
                  }
                  else{
                    alert('could not upload file');
                  }
                }
              };
              xhr.onload = function(){
                clipLabel.innerHTML = `<a href=${url}>${clipName}</a>`;
                console.log('Done', xhr.readyState, xhr.status);
              };
              xhr.send(data);
              };

              function uploadLink(url){
                     fetch(`http://nhubrecorder.herokuapp.com/create?v=${url}`, {
                    method: 'POST',
                      headers: new Headers({
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }),
                }).then(function(response){
                   console.log(response);
                   getLink();
                 })
                .catch(function(error){
                    console.log(error + ' This is an error')
                });
                
              };
         
           audio.src = audioURL;
           sendButton.onclick = function(e){
            var audio = document.getElementById('audio');
         //----------------------------------------------------
              // Save audio as file
                //  var a = document.createElement('a');
                // document.body.appendChild(a);
                // a.style = 'display: none';
                // a.href = form.url;
                // a.download = 'test.webm';
                // a.click();
                // console.log(e.data);
          //---------------------------------------------------------------------
                
           }
           deleteButton.onclick = function(e) {
             evtTgt = e.target;
             evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
           }
      	 }
      },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );
} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  var source = audioCtx.createMediaStreamSource(stream);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);
  
  WIDTH = canvas.width
  HEIGHT = canvas.height;

  draw()

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {
 
      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}
