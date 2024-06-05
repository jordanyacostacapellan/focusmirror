// Get references to the video container, buttons, and timer
const videoContainer = document.getElementById('video-container');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const timerElement = document.getElementById('timer');

// Video stream variable
let stream;
let isCameraOn = false; 

// Timer variables
let intervalId;
let seconds = 0;
let isTimerRunning = false;

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
        startTimer(); // Start timer immediately
    } catch (error) {
        console.error('Error accessing webcam:', error);
        if (error.name === 'NotAllowedError') {
            alert('Please allow camera access to use FocusMirror.');
        } else {
            alert('An error occurred while accessing the webcam.');
        }
    }
}

function startTimer() {
  if (!isTimerRunning) {
    intervalId = setInterval(() => {
      seconds++;
      updateTimerDisplay();
    }, 1000); 
    isTimerRunning = true;
  }
}

function pauseTimer() {
  clearInterval(intervalId);
  isTimerRunning = false;
}

function stopTimer() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoContainer.innerHTML = ''; 
    }
  
    clearInterval(intervalId);
    seconds = 0;
    updateTimerDisplay();
    isTimerRunning = false;
    isCameraOn = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = "Pause Session"; 
    stopButton.disabled = true;
}

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
