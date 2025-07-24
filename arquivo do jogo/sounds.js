// Pega os elementos de áudio
const bgAudio = document.getElementById('bg-audio');
const soundLeft = document.getElementById('sound-left');
const soundRight = document.getElementById('sound-right');
const soundBackward = document.getElementById('sound-backward');
const soundForward = document.getElementById('sound-forward');

// Ajusta volumes
bgAudio.volume = 0.3;
soundLeft.volume = 0.15;
soundRight.volume = 0.15;
soundBackward.volume = 0.15;
soundForward.volume = 0.15;

// Começa o som ambiente em loop após interação do usuário
let bgAudioStarted = false;
function tryStartBgAudio() {
  if (!bgAudioStarted) {
    bgAudio.play().catch(() => {});
    bgAudioStarted = true;
  }
}
document.addEventListener('keydown', tryStartBgAudio);
document.addEventListener('touchstart', tryStartBgAudio);

// Função para tocar som enquanto tecla estiver pressionada
const keysDownSounds = {
  'arrowleft': soundLeft,
  'a': soundLeft,
  'arrowright': soundRight,
  'd': soundRight,
  'arrowup': soundForward,
  'w': soundForward,
  'arrowdown': soundBackward,
  's': soundBackward,
};

const activeSounds = new Set();

function playSoundForKey(key) {
  const sound = keysDownSounds[key];
  if (sound && !activeSounds.has(sound)) {
    sound.currentTime = 0;
    sound.loop = true;
    sound.play();
    activeSounds.add(sound);
  }
}

function stopSoundForKey(key) {
  const sound = keysDownSounds[key];
  if (sound && activeSounds.has(sound)) {
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
    activeSounds.delete(sound);
  }
}

// Eventos teclado
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  playSoundForKey(key);
});

document.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  stopSoundForKey(key);
});

// Eventos botões touch/mouse
const buttonsInfo = [
  { id: 'leftBtn', sound: soundLeft },
  { id: 'rightBtn', sound: soundRight },
  { id: 'upBtn', sound: soundForward },
  { id: 'downBtn', sound: soundBackward },
];

buttonsInfo.forEach(({ id, sound }) => {
  const btn = document.getElementById(id);
  if (!btn) return;

  btn.addEventListener('mousedown', () => {
    sound.currentTime = 0;
    sound.loop = true;
    sound.play();
  });
  btn.addEventListener('mouseup', () => {
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
  });
  btn.addEventListener('mouseleave', () => {
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
  });

  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    sound.currentTime = 0;
    sound.loop = true;
    sound.play();
  }, { passive: false });

  btn.addEventListener('touchend', () => {
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
  });
  btn.addEventListener('touchcancel', () => {
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
  });
});

