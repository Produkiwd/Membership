import React, { useState, useEffect } from 'react';

interface EntranceLoadingProps {
  onComplete: () => void;
}

export const EntranceLoading: React.FC<EntranceLoadingProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Memuat Prompt Database...');
  const [isExiting, setIsExiting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Initial tactile Apple impact
    const timerFlash = setTimeout(() => {
      setIsShaking(true);
      setIsFlashing(true);
    }, 280);

    // Laser Beam Progress (Cinematic 0.75x tempo: ~2.2s)
    const totalDuration = 2200;
    const intervalTime = 25;
    const step = 100 / (totalDuration / intervalTime);

    const interval = setInterval(() => {
      setProgress(prev => {
        const nextVal = prev + step;
        if (nextVal >= 100) {
          clearInterval(interval);
          setStatusText('Selesai');
          
          // Smooth transition directly into the application
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              onComplete();
            }, 450);
          }, 180);

          return 100;
        }

        if (nextVal > 70) {
          setStatusText('Menghubungkan Growth Journal...');
        } else if (nextVal > 35) {
          setStatusText('Menyusun SCQA Framework...');
        }

        return nextVal;
      });
    }, intervalTime);

    return () => {
      clearTimeout(timerFlash);
      clearInterval(interval);
    };
  }, [onComplete]);

  const promptLetters = 'PROMPT'.split('');
  const databaseLetters = 'DATABASE'.split('');

  return (
    <div className={`entrance-overlay ${isExiting ? 'fade-out' : ''}`}>
      <style>{`
        .entrance-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 34%, #FFFFFF 0%, #FAF8F5 45%, #EFECE3 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          overflow: hidden;
          user-select: none;
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .entrance-overlay.fade-out {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        .entrance-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.022) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.022) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 1;
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }

        .entrance-ambient-glow {
          position: absolute;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(229, 178, 56, 0.14) 0%, rgba(198, 146, 34, 0.04) 50%, transparent 75%);
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 2;
        }

        .entrance-viewport {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          will-change: transform;
        }

        .entrance-shaking {
          animation: entranceShock 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes entranceShock {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px) scale(1.005); }
          40% { transform: translate(2px, -2px) scale(1.002); }
          60% { transform: translate(-1px, 1px) scale(1.001); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .entrance-impact-flash {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, rgba(229, 178, 56, 0.2) 50%, transparent 75%);
          opacity: 0;
          pointer-events: none;
          z-index: 15;
        }

        .entrance-flashing {
          animation: entranceFlash 0.4s ease-out;
        }

        @keyframes entranceFlash {
          0% { opacity: 1; transform: scale(0.96); }
          100% { opacity: 0; transform: scale(1.2); }
        }

        .entrance-title-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .entrance-title-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          text-transform: uppercase;
          line-height: 0.90;
          font-size: clamp(26px, 4.2vw, 46px);
          letter-spacing: -0.025em;
          gap: 2px;
          text-align: center;
          position: relative;
        }

        .entrance-word-prompt {
          color: #11100E;
          display: inline-flex;
          position: relative;
          text-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .entrance-word-database {
          color: #C69222;
          background: linear-gradient(135deg, #8E6510 0%, #C69222 28%, #F2C95C 50%, #C69222 75%, #7D570A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 4px 20px rgba(198, 146, 34, 0.35));
          display: inline-flex;
          position: relative;
        }

        .entrance-char {
          display: inline-block;
          opacity: 0;
          will-change: transform, opacity, filter;
          animation: entranceCharMerge 0.96s cubic-bezier(0.12, 1.08, 0.22, 1) forwards;
        }

        @keyframes entranceCharMerge {
          0% {
            opacity: 0;
            transform: scale(2.0) scaleX(1.35) skewX(-20deg) translateY(-38px);
            filter: blur(14px);
          }
          65% {
            opacity: 1;
            transform: scale(0.96) scaleX(0.96) skewX(4deg) translateY(3px);
            filter: blur(0px);
          }
          82% {
            transform: scale(1.02) scaleX(1.01) skewX(-1.5deg) translateY(-1px);
          }
          100% {
            opacity: 1;
            transform: scale(1) scaleX(1) skewX(0deg) translateY(0);
            filter: blur(0px);
          }
        }

        .entrance-specular-beam {
          position: absolute;
          inset: -30%;
          background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.95) 50%, transparent 62%);
          transform: translateX(-160%);
          pointer-events: none;
          mix-blend-mode: overlay;
          opacity: 0;
          z-index: 25;
          animation: entranceBeamSweep 1.2s ease-out forwards;
          animation-delay: 1.26s;
        }

        @keyframes entranceBeamSweep {
          0% { transform: translateX(-160%); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateX(160%); opacity: 0; }
        }

        .entrance-loader-container {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 260px;
          z-index: 20;
        }

        .entrance-loader-laser {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .entrance-laser-track {
          width: 100%;
          height: 2.5px;
          background: rgba(0, 0, 0, 0.07);
          border-radius: 999px;
          position: relative;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .entrance-laser-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #966A0E 0%, #C69222 40%, #F2C95C 85%, #FFFFFF 100%);
          box-shadow: 0 0 14px rgba(229, 178, 56, 0.85), 0 0 5px #C69222;
          border-radius: 999px;
          transition: width 0.06s linear;
        }

        .entrance-laser-bead {
          position: absolute;
          right: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 0 8px #FFFFFF, 0 0 12px #E5B238;
        }

        .entrance-laser-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          color: #7A756F;
        }

        .entrance-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #383430;
          font-weight: 600;
        }

        .entrance-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C69222;
          box-shadow: 0 0 7px #C69222;
          animation: entranceBlink 0.8s infinite alternate;
        }

        .entrance-percent {
          color: #8E6510;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        @keyframes entranceBlink {
          0% { opacity: 0.25; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

      <div className="entrance-grid" />
      <div className="entrance-ambient-glow" />
      <div className={`entrance-impact-flash ${isFlashing ? 'entrance-flashing' : ''}`} />

      <div className={`entrance-viewport ${isShaking ? 'entrance-shaking' : ''}`}>
        <div className="entrance-title-stage">
          <div className="entrance-title-row">
            <div className="entrance-word-prompt">
              {promptLetters.map((char, i) => (
                <span
                  key={`p-${i}`}
                  className="entrance-char"
                  style={{ animationDelay: `${(0.08 + i * 0.045) * 1.333}s` }}
                >
                  {char}
                </span>
              ))}
            </div>
            <div className="entrance-word-database">
              {databaseLetters.map((char, i) => (
                <span
                  key={`d-${i}`}
                  className="entrance-char"
                  style={{ animationDelay: `${(0.32 + i * 0.045) * 1.333}s` }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
          <div className="entrance-specular-beam" />
        </div>

        <div className="entrance-loader-container">
          <div className="entrance-loader-laser">
            <div className="entrance-laser-track">
              <div
                className="entrance-laser-fill"
                style={{ width: `${progress}%` }}
              >
                <span className="entrance-laser-bead" />
              </div>
            </div>
            <div className="entrance-laser-meta">
              <div className="entrance-status">
                <span className="entrance-dot" />
                <span>{statusText}</span>
              </div>
              <div className="entrance-percent">{Math.floor(progress)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntranceLoading;
