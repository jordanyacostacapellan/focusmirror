// Get references to the video container, buttons, and timer
const videoContainer = document.getElementById('video-container');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const timerElement = document.getElementById('timer');
const placeholderImage = document.getElementById('placeholderImage');

// Video stream and face detection variables
let stream;
let isCameraOn = false; 
let faceDetections = [];

// Timer variables
let intervalId;
let seconds = 0;
let isTimerRunning = false;

// Load face-api.js models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'), // Corrected path to './models'
    faceapi.nets.faceLandmark68Net.loadFromUri('./models')  // Corrected path to './models'
]).then(startVideo);

async function startVideo() {
    // Check for an existing video element (in case of pause/resume)
    const existingVideo = videoContainer.querySelector('video');
    if (existingVideo) {
        existingVideo.play();
        return; 
    }

    getWebcam();
}

// Function to get webcam access
async function getWebcam() {
    if (isCameraOn) {
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
        // Start timer immediately when camera turns on
        startTimer();

        // Hide the placeholder image
        placeholderImage.style.display = 'none';

        // Update container to fill the space
        videoContainer.style.justifyContent = 'center';
        videoContainer.style.alignItems = 'center';
        videoContainer.style.width = '400px'; 

        // Start face detection loop
        detectFaces();

    } catch (error) {
        console.error('Error accessing webcam:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            alert('Please allow camera access to use FocusMirror.');
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
           alert("No camera found. Please make sure you have a camera connected.");
        }
        else {
            alert('An error occurred while accessing the webcam.');
        }
    }
}

// Function to detect faces
async function detectFaces() {
    const videoEl = document.querySelector("#video-container video"); 

    // options for face detection
    const options = new faceapi.TinyFaceDetectorOptions();

    // main loop
    while (isCameraOn) {
        faceDetections = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks(); 
        console.log("Face detections:", faceDetections); 

        // (Add code to send the faceDetections data to your emotion detection API here.)

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait a bit before next iteration
    }
}

// Function to start the timer
function startTimer() {
    if (!isTimerRunning) {
        intervalId = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000); // Update timer every second
        isTimerRunning = true;
    }
}

// Function to pause the timer
function pauseTimer() {
    clearInterval(intervalId);
    isTimerRunning = false;
}

// Function to stop the session and camera
function stopTimer() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        stream = null;
    }

    clearInterval(intervalId);
    seconds = 0;
    updateTimerDisplay();
    isTimerRunning = false;
    isCameraOn = false;
    
    // Reset button states
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = "Pause Session";
    stopButton.disabled = true;

    // Remove the video element only, not the container.
    const videoElement = videoContainer.querySelector('video');
    if (videoElement) {
        videoContainer.removeChild(videoElement);
    }

    // Show the placeholder image
    placeholderImage.style.display = 'block';
}

// Function to update timer display
function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    timerElement.textContent = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}


function pad(num) {
    return (num < 10 ? "0" : "") + num;
}

// Event listeners for pause and stop buttons
pauseButton.addEventListener('click', () => {
    if (isTimerRunning) {
        pauseTimer();
        pauseButton.textContent = "Resume Session";
    } else {
        startTimer();
        pauseButton.textContent = "Pause Session";
    }
});

stopButton.addEventListener('click', stopTimer);


// Start the timer when the webcam is turned on
videoContainer.addEventListener('play', startTimer);
videoContainer.addEventListener('pause', pauseTimer);


// Event listener for start button
startButton.addEventListener('click', getWebcam);
