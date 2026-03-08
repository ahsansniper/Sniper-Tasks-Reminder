export const playTune = (tuneUrl: string | null) => {
  if (tuneUrl) {
    const audio = new Audio(tuneUrl);
    audio.play().catch(e => console.error("Audio play failed", e));
  } else {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800; // Hz
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 500);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }
};
