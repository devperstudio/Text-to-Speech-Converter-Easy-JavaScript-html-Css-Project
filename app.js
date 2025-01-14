// Elements from the DOM
const textInput = document.getElementById("text-input");
const voiceSelect = document.getElementById("voice-select");
const listenBtn = document.getElementById("listen-btn");
const listenIcon = document.getElementById("listen-icon");
const downloadBtn = document.getElementById("download-btn");
const downloadText = document.getElementById("download-text");
const loadingSpinner = document.getElementById("loading-spinner");

// Initialize the speech synthesis API and variables
let speech = new SpeechSynthesisUtterance();
let voices = [];
let isSpeaking = false;
let isPaused = false;

// Populate voice options when available
function populateVoices() {
  voices = window.speechSynthesis.getVoices();
  voices.forEach((voice, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

window.speechSynthesis.onvoiceschanged = populateVoices;
populateVoices(); // Call it initially

// Update selected voice for speech synthesis
voiceSelect.addEventListener("change", () => {
  speech.voice = voices[voiceSelect.value];
});

// Handle the Listen button functionality
listenBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (!text) {
    alert("Please enter text to listen!");
    return;
  }

  if (isSpeaking && !isPaused) {
    window.speechSynthesis.pause();
    listenIcon.src = "img/play.png";
    isPaused = true;
  } else if (isSpeaking && isPaused) {
    window.speechSynthesis.resume();
    listenIcon.src = "img/pause.png";
    isPaused = false;
  } else {
    speech.text = text;
    window.speechSynthesis.speak(speech);
    listenIcon.src = "img/pause.png";
    isSpeaking = true;
  }
});

// Reset state when speech ends
speech.onend = () => {
  listenIcon.src = "img/play.png";
  isSpeaking = false;
  isPaused = false;
};





// Handle the Download button functionality
downloadBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  if (!text) {
    alert("Please enter text to download!");
    return;
  }

  downloadText.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    // Use a proxy to avoid CORS issues
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);

    const response = await fetch(proxyUrl);
    const data = await response.json();
    const blob = await fetch(data.contents);

    const audioBlob = await blob.blob();
    const audioURL = URL.createObjectURL(audioBlob);

    const link = document.createElement("a");
    link.href = audioURL;
    link.download = "text-to-speech.mp3";
    link.click();

    downloadText.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
  } catch (error) {
    console.error("Error generating MP3:", error);
    alert("An error occurred while generating the MP3.");
    downloadText.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
  }
});
