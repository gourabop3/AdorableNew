import "@/components/loader.css";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="text-xl font-semibold mb-4">Creating Your App</div>
        <div className="text-sm text-gray-600 mb-6">
          This may take a few moments...
        </div>
        <div className="loader mb-4"></div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Setting up Git repository</div>
          <div>• Creating development environment</div>
          <div>• Initializing database</div>
          <div>• Preparing your app</div>
        </div>
        <div className="mt-6 text-xs text-gray-400">
          If this takes too long, try refreshing the page
        </div>
      </div>
    </div>
  );
}
