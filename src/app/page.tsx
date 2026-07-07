import Link from 'next/link';
import { Sparkles, Globe, Shield, Heart, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="launcher">
      {/* Hero */}
      <div className="launcher-hero">
        <div className="hero-card">
          <p className="kicker">Mina&apos;s First Platform</p>
          <h1>Mina&apos;s World</h1>
          <p style={{ marginTop: 12 }}>
            A safe kawaii sandbox where kids design chibi avatars, build tiny worlds, and visit friends.
          </p>
          <div className="button-row" style={{ marginTop: 18 }}>
            <Link href="/studio" className="primary-btn">
              <Sparkles size={16} style={{ marginRight: 6 }} />
              Create Avatar
            </Link>
            <Link href="/worlds" className="secondary-btn">
              <Globe size={16} style={{ marginRight: 6 }} />
              Build World
            </Link>
          </div>
          <div className="button-row" style={{ marginTop: 12 }}>
            <Link href="/play" className="primary-btn" style={{ background: '#00B398', color: '#fff' }}>
              🎮 Play 3D Voxel World
            </Link>
            <Link href="/join" className="secondary-btn">
              🔑 Join Friend&apos;s World
            </Link>
          </div>
        </div>

        {/* Screen Gallery */}
        <div className="screen-gallery">
          <ScreenCard href="/studio" title="Avatar" icon="✨" desc="Design your chibi" color="#8B5CF6" />
          <ScreenCard href="/worlds" title="Build" icon="🌍" desc="Create your world" color="#10B981" />
          <ScreenCard href="/worlds" title="Visit" icon="👋" desc="See friends" color="#EC4899" />
          <ScreenCard href="/worlds" title="Quests" icon="🗺️" desc="Daily adventures" color="#F59E0B" />
          <ScreenCard href="/studio" title="Shop" icon="🎁" desc="New styles" color="#3B82F6" />
        </div>
      </div>

      {/* Snapshot Grid */}
      <div className="snapshot-grid">
        <div className="mini-card">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#8B5CF6]" />
            <span className="text-xs font-bold text-[#6B7280]">Friends</span>
          </div>
          <strong className="text-[#004F71]">3</strong>
          <p className="text-[10px]">approved friends online</p>
        </div>

        <div className="mini-card">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#10B981]" />
            <span className="text-xs font-bold text-[#6B7280]">Safety</span>
          </div>
          <strong className="text-[#004F71]">On</strong>
          <p className="text-[10px]">friends-only sharing</p>
        </div>

        <div className="mini-card">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#F59E0B]" />
            <span className="text-xs font-bold text-[#6B7280]">Build</span>
          </div>
          <strong className="text-[#004F71]">68%</strong>
          <p className="text-[10px]">Cloud Plaza decorated</p>
        </div>

        <div className="mini-card">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#EC4899]" />
            <span className="text-xs font-bold text-[#6B7280]">Love</span>
          </div>
          <strong className="text-[#004F71]">Mina</strong>
          <p className="text-[10px]">Made with love by Dad</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-xs text-[#9CA3AF]">
          Made with <Heart size={12} className="inline text-[#EF4444]" /> by Mina &amp; Dad
        </p>
      </footer>
    </div>
  );
}

function ScreenCard({ href, title, icon, desc, color }: {
  href: string; title: string; icon: string; desc: string; color: string;
}) {
  return (
    <div className="launcher-card">
      <Link href={href} className="block">
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: `color-mix(in oklch, ${color}, white 80%)` }}
        >
          <span className="text-3xl">{icon}</span>
        </div>
        <h4 className="font-bold text-[#004F71]">{title}</h4>
        <p className="text-xs mt-1">{desc}</p>
      </Link>
    </div>
  );
}
