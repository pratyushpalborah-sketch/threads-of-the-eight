import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AIChat from '@/components/AIChat';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Threads of the Eight — Northeast India Handicrafts Museum',
  description:
    'An interactive NIFT Shillong Project museum of the traditional handicrafts of the eight Northeast Indian states — weaves, masks, bamboo, pottery, jewellery and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-paper min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-72px)]">{children}</main>
          <AIChat />
          <Toaster richColors position="top-right" />
          <footer className="border-t border-border/60 mt-24 py-10 bg-stone-900 text-stone-300">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div>
                <span className="font-serif text-xl text-amber-200">Threads of the Eight</span>
                <span className="opacity-60 ml-3">A NIFT Shillong Project museum of Northeast India handicrafts.</span>
              </div>
              <div className="opacity-70">Crafted with care · Built on Next.js, MongoDB &amp; AD-4 Research project</div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
