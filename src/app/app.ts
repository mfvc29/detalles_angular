import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';

declare const confetti: any;
declare const YT: any;

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

  private ytPlayer: any = null;

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
        this.initYouTubePlayer();
      }, 80);
    }, 500);
  }

  toggleAudio() {
    if (!this.ytPlayer) return;
    if (this.isPlaying) {
      this.ytPlayer.pauseVideo();
      this.isPlaying = false;
    } else {
      this.ytPlayer.playVideo();
      this.isPlaying = true;
    }
    this.cdr.detectChanges();
  }

  private initYouTubePlayer() {
    const createPlayer = () => {
      this.ytPlayer = new YT.Player('yt-player', {
        width: '1',
        height: '1',
        videoId: 'sPMA1tqWuf4',
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: 0,
          start: 10,   // empieza en el segundo 10
          end: 268,    // se detiene en 4:28 (268 segundos)
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            this.isPlaying = true;
            this.cdr.detectChanges();
          },
          onStateChange: (event: any) => {
            // Cuando el video termina (ENDED = 0), vuelve al segundo 10
            if (event.data === 0) {
              this.ytPlayer.seekTo(10, true);
              this.ytPlayer.playVideo();
              this.isPlaying = true;
            } else {
              // 1 = playing, 2 = paused
              this.isPlaying = event.data === 1;
            }
            this.cdr.detectChanges();
          },
        },
      });
    };

    if (typeof YT !== 'undefined' && YT.Player) {
      createPlayer();
    } else {
      // API not ready yet — wait for the global callback
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }
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
