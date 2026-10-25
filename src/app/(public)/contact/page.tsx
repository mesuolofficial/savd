import { getSettings } from "@/lib/settings";
import { ContactForm } from "@/components/public/ContactForm";
import { MeltEdge } from "@/components/public/MeltEdge";

// Custom SVGs taake koi library error na aaye
const IgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const FbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Get in touch</p>
          <h1>Contact Us</h1>
          <p className="sub">Have a question? We would love to hear from you.</p>
        </div>
      </header>
      <MeltEdge seed={88} />

      <section className="pg">
        <div className="wrap max-w-5xl mx-auto grid md:grid-cols-[1fr_1.5fr] gap-8">
          
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="card p-6 bg-canvas">
              <h3 className="text-xl font-bold text-ink mb-6">Contact Information</h3>
              <p className="text-sm text-mist mb-6">Reach us through any of these</p>
              
              <div className="space-y-6">
                {settings.contactAddress && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-signal/10 text-signal flex items-center justify-center shrink-0">
                      <MapPinIcon />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">Address</p>
                      <p className="text-sm text-mist">{settings.contactAddress}</p>
                    </div>
                  </div>
                )}
                {settings.adminEmail && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-signal/10 text-signal flex items-center justify-center shrink-0">
                      <MailIcon />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">Email</p>
                      <a href={`mailto:${settings.adminEmail}`} className="text-sm text-mist hover:text-signal">{settings.adminEmail}</a>
                    </div>
                  </div>
                )}
                {settings.contactPhone && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-signal/10 text-signal flex items-center justify-center shrink-0">
                      <PhoneIcon />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">Phone</p>
                      <p className="text-sm text-mist">{settings.contactPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(settings.facebookUrl || settings.instagramUrl || settings.twitterUrl) && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-ink mb-4">Find us on social</h3>
                <div className="flex gap-3">
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-canvas border border-line flex items-center justify-center text-ink hover:bg-signal hover:text-white hover:border-signal transition-colors" title="Instagram">
                      <IgIcon />
                    </a>
                  )}
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-canvas border border-line flex items-center justify-center text-ink hover:bg-signal hover:text-white hover:border-signal transition-colors" title="Facebook">
                      <FbIcon />
                    </a>
                  )}
                  {settings.twitterUrl && (
                    <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-canvas border border-line flex items-center justify-center text-ink hover:bg-signal hover:text-white hover:border-signal transition-colors" title="Twitter / X">
                      <TwIcon />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Component */}
          <ContactForm />
        </div>
      </section>
    </>
  );
}