import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';

declare const confetti: any;

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('detalle-especial');
  isPopping = false;
  revealed = false;
  isPlaying = false;

  private audio: HTMLAudioElement | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  triggerSparkles(event: MouseEvent) {
    // Pop animation
    this.isPopping = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isPopping = false;
      this.cdr.detectChanges();
    }, 400);

    // Confetti burst
    if (typeof confetti !== 'undefined') {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x, y },
        shapes: ['star'],
        colors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#fddb92', '#96fbc4'],
        scalar: 1.3,
        gravity: 0.6,
      });

      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { x, y: y - 0.05 },
          shapes: ['circle'],
          colors: ['#ff6b9d', '#ff9a9e', '#fecfef', '#c4b5fd'],
          scalar: 0.9,
          gravity: 0.4,
        });
      }, 200);
    }

    // After sparkle, reveal romantic view
    setTimeout(() => {
      this.revealed = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.initStarfield();
        this.initAudioPlayer();
      }, 80);
    }, 500);
  }

  toggleAudio() {
    if (!this.audio) return;
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play();
      this.isPlaying = true;
    }
    this.cdr.detectChanges();
  }

  private initAudioPlayer() {
    // Load the local mp3 file
    this.audio = new Audio('perfect.mp3');
    this.audio.currentTime = 10; // Start at second 10

    // timeupdate event fires continuously during playback
    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      // Loop back to 10s if we reach 4:28 (268 seconds)
      if (this.audio.currentTime >= 268) {
        this.audio.currentTime = 10;
        this.audio.play();
      }
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });

    this.audio.play().then(() => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    }).catch(err => {
      console.error("Autoplay prevented:", err);
    });
  }

  private initStarfield() {
    const canvas = document.getElementById('star-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.005 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (t: number) => {
      if (!this.revealed) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const a = 0.4 + 0.5 * Math.sin(s.phase + t * s.speed);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,240,${a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
}
