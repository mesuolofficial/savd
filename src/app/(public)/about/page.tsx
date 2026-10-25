import type { Metadata } from "next";
import Link from "next/link";
import { MeltEdge } from "@/components/public/MeltEdge";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 80 }}>
        <div className="wrap">
          <p className="ey">Our Story</p>
          <h1>About SAVD</h1>
          <p className="sub">Pakistan&apos;s first national autonomous underwater vehicle competition.</p>
        </div>
      </header>
      <MeltEdge seed={90} />

      <section className="pg">
        <div className="wrap">
          
          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <p className="ey text-signal mb-2">A National First</p>
              <h2 className="text-4xl mb-6">Design. Build. Dive.</h2>
              <p className="text-mist leading-relaxed mb-4">
                SAVD (Submersible Autonomous Vehicle Design) is Pakistan&apos;s premier national engineering competition. Organized by the Mechanical Engineering Society (MES) at the University of Lahore, it brings together the brightest minds from universities across the country.
              </p>
              <p className="text-mist leading-relaxed mb-6">
                Our mission is simple: to push the boundaries of student engineering by challenging teams to design, fabricate, and pilot their own autonomous underwater vehicles. It bridges the gap between classroom theory and real-world, high-stakes robotics.
              </p>
              <Link href="/competitions" className="btn b1">Explore Competitions</Link>
            </div>
            <div className="card p-0 overflow-hidden border-none shadow-xl">
              {/* FIXED: Removed onError. Using a direct static image URL */}
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200" 
                alt="SAVD Underwater Vehicle" 
                className="w-full h-auto object-cover" 
              />
            </div>
          </div>

          {/* Timeline Section */}
          <div className="text-center mb-16">
            <p className="ey text-signal mb-2">The Journey</p>
            <h2 className="text-4xl">Editions Timeline</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 mb-24">
            {/* Timeline Item 1 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-signal text-white flex items-center justify-center font-bold text-lg shadow-lg">26</div>
                <div className="w-0.5 h-full bg-line my-2"></div>
              </div>
              <div className="card p-6 flex-1 bg-canvas">
                <h3 className="text-2xl font-bold text-ink mb-1">SAVD 2026</h3>
                <p className="text-sm text-mist mb-3">August 10–11, 2026 · University of Lahore</p>
                <p className="text-mist">The inaugural edition. 14 teams from 5 leading universities competed in the swimming pool, navigating underwater gates and testing full autonomy. Team AK from PUCIT took home the championship.</p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#D9A441] text-white flex items-center justify-center font-bold text-lg shadow-lg">27</div>
              </div>
              <div className="card p-6 flex-1 border-[#D9A441]/30">
                <h3 className="text-2xl font-bold text-ink mb-1">SAVD 2027</h3>
                <p className="text-sm text-mist mb-3">Coming Soon · University of Lahore</p>
                <p className="text-mist">The legacy continues. We are expanding the competition to include more universities, bigger challenges, and a larger prize pool. Prepare for deeper dives and tougher autonomy.</p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-12">
            <p className="ey text-signal mb-2">What Drives Us</p>
            <h2 className="text-4xl">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-8 text-center hover:-translate-y-1 transition-transform">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-sm text-mist">Pushing students to think beyond textbooks and create real-world solutions for complex underwater problems.</p>
            </div>
            <div className="card p-8 text-center hover:-translate-y-1 transition-transform">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Collaboration</h3>
              <p className="text-sm text-mist">Bringing together engineers, programmers, and designers to work as one unified team.</p>
            </div>
            <div className="card p-8 text-center hover:-translate-y-1 transition-transform">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-sm text-mist">Maintaining the highest standards of engineering, safety, and fair competition.</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}