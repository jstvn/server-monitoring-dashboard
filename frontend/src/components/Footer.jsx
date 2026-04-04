const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs font-medium text-slate-500 sm:px-6 lg:px-8">
        © {currentYear} Server Monitoring Dashboard. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
