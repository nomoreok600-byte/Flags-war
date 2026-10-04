import { Country, DropType } from '../types/game';

type CommentaryCallback = (text: string) => void;

export interface VoicePreset {
  id: string;
  name: string;
  rate: number;
  pitch: number;
}

export const VOICE_PRESETS: VoicePreset[] = [
  { id: 'esports', name: '🔥 Esports Hype Caster', rate: 1.14, pitch: 1.12 },
  { id: 'stadium', name: '🏟️ Stadium Announcer', rate: 1.08, pitch: 1.04 },
  { id: 'radio', name: '📻 Radio Broadcaster', rate: 1.02, pitch: 0.98 },
  { id: 'speed', name: '⚡ Ultra Fast Caster', rate: 1.22, pitch: 1.15 },
];

class CommentatorEngine {
  private synth: SpeechSynthesis | null = null;
  private selectedVoiceURI: string = '';
  private availableVoices: SpeechSynthesisVoice[] = [];
  private enabled: boolean = true;
  private volume: number = 1.0;
  private currentPreset: VoicePreset = VOICE_PRESETS[0];
  private lastSpokenTime: number = 0;
  private minIntervalMs: number = 3200;
  private onSubtitleListeners: CommentaryCallback[] = [];
  private onVoicesChangedListeners: ((voices: SpeechSynthesisVoice[]) => void)[] = [];
  private currentSubtitle: string = 'Welcome to Flag Wars 24/7! Watch nations clash for world domination!';
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoiceLoading();
    }
  }

  private initVoiceLoading() {
    if (!this.synth) return;

    const fetchVoices = () => {
      if (!this.synth) return;
      const raw = this.synth.getVoices();
      if (raw && raw.length > 0) {
        // Sort with English first, but include ALL voices so it works on any RDP/OS
        const english = raw.filter((v) => v.lang.toLowerCase().includes('en'));
        const others = raw.filter((v) => !v.lang.toLowerCase().includes('en'));
        this.availableVoices = [...english, ...others];

        // Auto select best natural voice if none selected
        if (!this.selectedVoiceURI) {
          const preferred = [
            'Microsoft Christopher Online',
            'Microsoft Guy Online',
            'Microsoft Andrew Online',
            'Microsoft Jenny Online',
            'Google UK English Male',
            'Google US English',
            'Natural',
            'Neural',
            'Daniel',
            'Samantha',
          ];
          let chosen = this.availableVoices.find((v) =>
            preferred.some((p) => v.name.toLowerCase().includes(p.toLowerCase()))
          );
          if (!chosen && this.availableVoices.length > 0) {
            chosen = this.availableVoices[0];
          }
          if (chosen) {
            this.selectedVoiceURI = chosen.voiceURI;
          }
        }

        this.notifyVoicesUpdated();
      }
    };

    fetchVoices();
    if (this.synth.addEventListener) {
      this.synth.addEventListener('voiceschanged', fetchVoices);
    }
    // Fallback polling for browsers that delay populating voice list
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      fetchVoices();
      if (this.availableVoices.length > 0 || pollCount > 10) {
        clearInterval(pollInterval);
      }
    }, 250);
  }

  private notifyVoicesUpdated() {
    this.onVoicesChangedListeners.forEach((cb) => cb([...this.availableVoices]));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  public getSelectedVoiceURI(): string {
    return this.selectedVoiceURI;
  }

  public setVoiceByURI(voiceURI: string) {
    this.selectedVoiceURI = voiceURI;
  }

  public setPreset(presetId: string) {
    const p = VOICE_PRESETS.find((item) => item.id === presetId);
    if (p) {
      this.currentPreset = p;
    }
  }

  public getCurrentPreset(): VoicePreset {
    return this.currentPreset;
  }

  public onVoicesUpdated(callback: (voices: SpeechSynthesisVoice[]) => void) {
    this.onVoicesChangedListeners.push(callback);
    if (this.availableVoices.length > 0) {
      callback([...this.availableVoices]);
    }
    return () => {
      this.onVoicesChangedListeners = this.onVoicesChangedListeners.filter((cb) => cb !== callback);
    };
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public unlockAudio() {
    this.isUnlocked = true;
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public subscribeSubtitles(callback: CommentaryCallback) {
    this.onSubtitleListeners.push(callback);
    return () => {
      this.onSubtitleListeners = this.onSubtitleListeners.filter((cb) => cb !== callback);
    };
  }

  private emitSubtitle(text: string) {
    this.currentSubtitle = text;
    this.onSubtitleListeners.forEach((cb) => cb(text));
  }

  public getCurrentSubtitle(): string {
    return this.currentSubtitle;
  }

  /**
   * Speaks with dynamic human commentator delivery
   */
  public speak(text: string, isHype: boolean = false, force: boolean = false) {
    this.emitSubtitle(text);

    if (!this.enabled || !this.synth) return;
    const now = Date.now();
    if (!force && now - this.lastSpokenTime < this.minIntervalMs) {
      return;
    }

    try {
      this.synth.cancel(); // Cancel stale speech

      const utterance = new SpeechSynthesisUtterance(text);

      // Find selected voice
      if (this.selectedVoiceURI && this.availableVoices.length > 0) {
        const found = this.availableVoices.find((v) => v.voiceURI === this.selectedVoiceURI);
        if (found) {
          utterance.voice = found;
        }
      }

      utterance.volume = this.volume;
      // Combine preset rate/pitch with hype elevation
      const baseRate = this.currentPreset.rate;
      const basePitch = this.currentPreset.pitch;
      utterance.rate = isHype ? Math.min(1.3, baseRate * 1.08) : baseRate;
      utterance.pitch = isHype ? Math.min(1.35, basePitch * 1.1) : basePitch;

      this.lastSpokenTime = now;
      this.synth.speak(utterance);
    } catch {
      // Audio safety
    }
  }

  // --- Hype Sports Broadcaster Commentary Lines ---

  public announceMatchStart(countries: Country[]) {
    const names = countries.map((c) => c.name).join(', ');
    const lines = [
      `Round begins! We have ${names} battling for total world supremacy! Let's get it on!`,
      `Here we go! Four nations lock horns in the arena! Who will claim 100 percent of the board?`,
      `The battle is live! ${names} are launching their country balls into the grid!`,
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], false, true);
  }

  public announceDominance(country: Country, pct: number) {
    const lines = [
      `Look at that push! ${country.name} now commands over ${Math.round(pct)} percent of the arena!`,
      `Unstoppable momentum! ${country.name} is tearing through enemy territory!`,
      `Huge territory takeover by ${country.name}! They're taking control of the entire grid!`,
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], true);
  }

  public announceBallSpawn(country: Country, ballCount: number) {
    const lines = [
      `Extra ball for ${country.name}! Now attacking with ${ballCount} country balls!`,
      `Territory milestone reached! ${country.name} multiplies!`,
      `${country.name} adds another ball to the field! Total firepower increasing!`,
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], false);
  }

  public announceDropCollected(country: Country, type: DropType) {
    if (type === 'bomb') {
      const lines = [
        `BOOM! ${country.name} collected the Bomb! Devastating blast across the grid!`,
        `Direct hit! The Bomb detonated by ${country.name}! Massive territory wiped out!`,
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], true, true);
    } else if (type === 'multi_ball') {
      const lines = [
        `Jackpot! ${country.name} collects plus two extra balls!`,
        `Firepower multiplied! ${country.name} gains two bonus balls!`,
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], true);
    } else if (type === 'speed') {
      const lines = [
        `Supercharged! ${country.name} is on fire with maximum turbo speed!`,
        `Speed boost activated for ${country.name}! Slicing through enemy lines!`,
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], true);
    } else if (type === 'laser') {
      const lines = [
        `Laser strike unleashed! ${country.name} carves through the entire arena!`,
        `Orbital laser triggered by ${country.name}! What a devastating move!`,
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], true, true);
    } else if (type === 'freeze') {
      const lines = [
        `BLIZZARD PROTOCOL! ${country.name} has frozen all enemy balls! Shatter them now!`,
        `DEEP FREEZE! ${country.name} locks every opponent in solid ice! Vulnerable to instant death!`,
        `Ice age incoming! ${country.name} picked up the Freeze! Hit the frozen balls to shatter them!`,
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], true, true);
    }
  }

  public announceBallShatter(attacker: Country, victim: Country) {
    const lines = [
      `CRACK! ${attacker.name} just shattered ${victim.name}'s frozen ball into a million ice shards!`,
      `FATAL SHATTER! ${attacker.name} smashes ${victim.name}'s frozen ball to pieces!`,
      `ICE BREAKER! ${victim.name}'s frozen ball is completely destroyed by ${attacker.name}!`,
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], true, true);
  }

  public announceElimination(country: Country) {
    const lines = [
      `AND DOWN THEY GO! ${country.name} has been completely eliminated!`,
      `Total wipeout! ${country.name} is wiped off the map! What a ruthless knockout!`,
      `Zero territory remaining! ${country.name} is finished!`,
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], true, true);
  }

  public announceVictory(country: Country) {
    const lines = [
      `IT'S ALL OVER! ${country.name} conquers the world! Total domination!`,
      `UNBELIEVABLE! ${country.name} stands alone as the undisputed world champion!`,
      `GAME OVER! ${country.name} completes the full map conquest! What an incredible match!`,
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], true, true);
  }
}

export const commentator = new CommentatorEngine();
