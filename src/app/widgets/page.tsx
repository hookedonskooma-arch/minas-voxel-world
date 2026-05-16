'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function WidgetsPage() {
  return (
    <div className="widgets-page">
      <Link href="/" className="block" style={{ marginBottom: 18 }}>
        <div style={{ height: 64 }}>
          <Logo style={{ height: '100%', width: 'auto' } as React.CSSProperties} />
        </div>
      </Link>

      <p className="kicker">iOS quick-access surfaces</p>
      <h1 style={{ maxWidth: '12ch' }}>Widgets that keep play safe and moving.</h1>
      <p style={{ marginTop: 16, maxWidth: '62ch' }}>
        These are outside-the-app surfaces: a Home Screen quest widget for kids, a parent safety glance, and a Lock Screen friend invite approval.
      </p>

      <section className="widget-grid">
        <article className="ios-widget large">
          <div>
            <span className="badge">Today&apos;s quest</span>
            <h2 style={{ marginTop: 12 }}>Cloud Garden</h2>
            <p>Place two cozy objects and invite one approved friend.</p>
          </div>
          <div className="world-grid" aria-hidden="true">
            <span className="tile" style={{ ['--tile' as string]: 'var(--mint)' }}>🌳</span>
            <span className="tile">+</span>
            <span className="tile" style={{ ['--tile' as string]: 'var(--sky)' }}>☁</span>
            <span className="tile" style={{ ['--tile' as string]: 'var(--bubble)' }}>🌸</span>
            <span className="tile">+</span>
            <span className="tile" style={{ ['--tile' as string]: 'var(--star)' }}>⭐</span>
          </div>
          <div className="widget-actions">
            <Link href="/quests"><button>Open quest</button></Link>
            <Link href="/worlds"><button>Add tree</button></Link>
          </div>
        </article>

        <article
          className="ios-widget large"
          style={{
            background:
              'linear-gradient(145deg, color-mix(in oklch, white, var(--mint) 30%), white)',
          }}
        >
          <div>
            <span className="badge">Parent glance</span>
            <h2 style={{ marginTop: 12 }}>Safe mode is on</h2>
            <p>Friend visits require approval. Free text chat is off.</p>
          </div>
          <div>
            <div className="safety-row">
              <span>Play timer</span>
              <strong>20 min</strong>
            </div>
            <div className="safety-row">
              <span>Sharing</span>
              <strong>Friends only</strong>
            </div>
            <div className="safety-row">
              <span>Pending</span>
              <strong>1 invite</strong>
            </div>
          </div>
          <div className="widget-actions">
            <Link href="/friends"><button>Approve</button></Link>
            <Link href="/onboarding"><button>Review</button></Link>
          </div>
        </article>

        <article>
          <div className="ios-widget lock">
            <p className="kicker">Mina&apos;s World</p>
            <h3>Lulu wants to visit</h3>
            <p>Approve 20 min playdate</p>
          </div>
          <div className="ios-widget" style={{ marginTop: 18, minHeight: 220 }}>
            <span className="badge">Live Activity</span>
            <h2 style={{ marginTop: 12 }}>Cloud Plaza build</h2>
            <p>68% decorated</p>
            <div className="progress" style={{ marginTop: 18, ['--value' as string]: '68%' }}>
              <span></span>
            </div>
            <div className="widget-actions">
              <Link href="/worlds"><button>Open app</button></Link>
              <button>Pause</button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
