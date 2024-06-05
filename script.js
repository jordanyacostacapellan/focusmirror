// Get references to the video container, buttons, and timer
const videoContainer = document.getElementById('video-container');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const timerElement = document.getElementById('timer');

// Video stream variable
let stream;
let isCameraOn = false; // Flag to track if camera is on or off

// Function to get webcam access
async function getWebcam() {
  if (isCameraOn) {
    // Camera is already on, don't do anything
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    videoContainer.appendChild(video);

    isCameraOn = true;
    startButton.disabled = true;
    pauseButton.disabled = false;
    stopButton.disabled = false;
  } catch (error) {
    console.error('Error accessing webcam:', error);
    if (error.name === 'NotAllowedError') {
      alert('Please allow camera access to use FocusMirror.');
    } else {
      alert('An error occurred while accessing the webcam.');
    }
  }
}

// Event listener for start button
startButton.addEventListener('click', getWebcam);

// Add logic for pause, stop, and timer here (as we progress further)
