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
    await this.audioContext.audioWorklet.addModule('music-worklet.js');

    this.musicProcessorNode = new AudioWorkletNode(this.audioContext, 'mp');
    
    this.musicProcessorNode.connect(this.audioContext.destination);
    this.isPlaying = true;
  }

  startMelody() {
    this.musicProcessorNode?.port.postMessage(0);
  }

  pause() {
    this.musicProcessorNode?.port.postMessage(1);
  }

  unpause() {
    this.musicProcessorNode?.port.postMessage(2);
  }

  stop() {
    if (this.isPlaying) {
      this.musicProcessorNode?.disconnect();
      this.isPlaying = false;
    }
  }
}

export default new MusicPlayer();
