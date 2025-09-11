class MusicPlayer {
  audioContext: AudioContext | undefined;
  startTime = 0;
  isPlaying = false;
  buffer: AudioBuffer | undefined;
  musicProcessorNode: AudioWorkletNode | undefined;

  async start() {
    if (this.isPlaying) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    await this.audioContext.resume();
    await this.audioContext.audioWorklet.addModule('/music-worklet.js');

    this.musicProcessorNode = new AudioWorkletNode(this.audioContext, 'music-processor');
    
    this.musicProcessorNode.connect(this.audioContext.destination);
    this.isPlaying = true;
  }

  pause() {
    this.musicProcessorNode?.port.postMessage({ name: 'pause' });
  }

  unpause() {
    this.musicProcessorNode?.port.postMessage({ name: 'unpause' });
  }

  stop() {
    if (this.isPlaying) {
      this.musicProcessorNode?.disconnect();
      this.isPlaying = false;
    }
  }

  startMelody() {
    this.musicProcessorNode?.port.postMessage({ name: 'start' });
  }
}

export default new MusicPlayer();
