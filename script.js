const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// store value in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// retrieve value from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// clear local storage
function clear() {
  localStorage.clear();
}

// get a random 3-digit number
function getRandomArbitrary(min, max) {
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  return random;
}

// generate SHA256 hash of a given string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// get or generate the SHA256 hash of a random 3-digit number
async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  let cachedPin = retrieve('pin');

  if (cachedHash && cachedPin) {
    return cachedHash;
  }

  const pin = getRandomArbitrary(MIN, MAX).toString();
  const hash = await sha256(pin);
  store('pin', pin);
  store('sha256', hash);
  return hash;
}

// initialize the interface with the hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// test the entered pin against the hash
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const enteredHash = await sha256(pin);
  const originalHash = retrieve('sha256');

  if (enteredHash === originalHash) {
    resultView.innerHTML = '🎉 success';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ failed';
    resultView.classList.remove('success');
  }

  resultView.classList.remove('hidden');
}

// ensure only numeric 3-digit input
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// attach check function to the button
document.getElementById('check').addEventListener('click', test);

// run the main function on load
main();