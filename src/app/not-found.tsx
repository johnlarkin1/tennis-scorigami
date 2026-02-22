import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p className="text-green-400 text-lg font-semibold mb-2">404</p>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-400 mb-8">
          Looks like this scoreline doesn&apos;t exist yet — a true scorigami.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
