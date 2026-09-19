import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Sobre', href: '#about' },
  { label: 'Sistemas', href: '#sistemas' },
  { label: 'Digital Toque', href: '#digital-toque' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Contato', href: '#contato' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-xl bg-[#050507]/70 border-b border-white/[0.04]' : ''
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-display font-bold text-sm text-white">
                K
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 opacity-0 group-hover:opacity-40 blur-lg transition-opacity" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-semibold tracking-tight text-[15px]">KAIZEM</span>
              <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase mt-0.5">Sistemas</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-violet-400 to-cyan-400 group-hover:w-4/5 transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href="#contato"
              className="relative px-5 py-2.5 rounded-full text-[13px] font-medium text-white overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500 group-hover:from-violet-500 group-hover:to-cyan-500 transition-all duration-500" />
              <span className="absolute inset-[1px] rounded-full bg-[#050507] group-hover:bg-transparent transition-all duration-500" />
              <span className="relative">Iniciar projeto →</span>
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Menu"
          >
            <span className={`w-5 h-px bg-white transition-all ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`w-5 h-px bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>

        <div className="h-px bg-white/[0.03]">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050507]/98 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col pt-32 px-8 gap-2">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="font-display text-3xl font-medium py-3 border-b border-white/[0.05] text-white/80 hover:text-white"
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href="#contato"
                onClick={() => setMobileOpen(false)}
                className="mt-6 px-6 py-4 rounded-full text-center font-medium bg-gradient-to-r from-violet-600 to-violet-500"
              >
                Iniciar projeto
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
