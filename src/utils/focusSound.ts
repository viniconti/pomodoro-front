type AudioContextConstructor = typeof AudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: AudioContextConstructor })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    audioContext = new AudioContextCtor();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume().catch(() => {});
  }

  return audioContext;
}

/** Chamada no clique de iniciar para liberar o áudio no navegador. */
export function prepareFocusSound() {
  getAudioContext();
}

/** Toque curto e suave para sinalizar o fim de um ciclo de foco. */
export function playFocusChime() {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  const agora = ctx.currentTime;
  const notas = [880, 1174.66, 1567.98];

  notas.forEach((frequencia, indice) => {
    const inicio = agora + indice * 0.16;
    const oscilador = ctx.createOscillator();
    const ganho = ctx.createGain();

    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(frequencia, inicio);

    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.16, inicio + 0.03);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.45);

    oscilador.connect(ganho);
    ganho.connect(ctx.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + 0.5);
  });
}
