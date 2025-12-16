import './globals.css'; // adjust path if needed

export const metadata = {
  title: 'CruxPad',
  description: 'Create condensed study notes from large texts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/cruxpad.png" sizes="any" />
      </head>
      <body className="min-h-screen bg-gray-50 print:bg-white">
        {children}
        <div className="hidden print:block fixed inset-0 bg-white z-50"></div>
      </body>
    </html>
  );
}
