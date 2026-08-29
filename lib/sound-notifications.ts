/**
 * Premium Web Audio API notification sounds and browser notifications.
 * Generates clean, delightful acoustic chimes without requiring external audio assets.
 */

class SoundNotificationManager {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays a crisp, subtle double-tone chime (like Intercom/Slack).
   */
  public playMessageChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // First tone (higher note)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Second tone (harmonic resolution)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain2.gain.setValueAtTime(0.18, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn("Could not play notification sound:", e);
    }
  }

  /**
   * Requests permission and fires a native browser desktop notification.
   */
  public async showDesktopNotification(title: string, options?: NotificationOptions) {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    try {
      if (Notification.permission === "granted") {
        new Notification(title, {
          icon: "/favicon.ico",
          ...options,
        });
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(title, {
            icon: "/favicon.ico",
            ...options,
          });
        }
      }
    } catch (e) {
      console.warn("Desktop notification failed:", e);
    }
  }
}

export const soundManager = new SoundNotificationManager();
