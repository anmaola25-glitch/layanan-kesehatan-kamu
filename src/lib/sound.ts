// Web Speech API and chime sound helper for calling queue numbers in Indonesian

export function playChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.75);

      setTimeout(resolve, 600);
    } catch {
      resolve();
    }
  });
}

export async function announceQueue(queueNumber: string, patientName: string) {
  await playChime();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    // Spell queue number with spaces e.g. "A 0 0 1"
    const spelledNumber = queueNumber.split('').join(' ');
    const text = `Nomor antrean, ${spelledNumber}. Atas nama, ${patientName}. Silakan menuju ruang praktik mantri.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try finding Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}
