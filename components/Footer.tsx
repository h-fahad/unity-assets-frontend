/* eslint-disable @next/next/no-html-link-for-pages */
// Footer Component Stub
export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
        <div>
          &copy; {new Date().getFullYear()} UnityAssets. All rights reserved.
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/" className="hover:underline">Home</a>
          <a href="/packages" className="hover:underline">Packages</a>
          <a href="/account" className="hover:underline">Account</a>
        </div>
      </div>
    </footer>
  );
} 