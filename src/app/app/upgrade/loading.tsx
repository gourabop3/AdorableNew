export default function UpgradeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Checking Your Credits</h2>
        <p className="text-gray-600">Verifying your account status...</p>
      </div>
    </div>
  );
}