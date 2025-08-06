import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserApps } from "@/actions/user-apps";
import { AppCard } from "./app-card";

export function UserApps() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["userApps"],
    queryFn: getUserApps,
    initialData: [],
  });

  // Safely handle the data
  const safeData = Array.isArray(data) ? data : [];

  const onAppDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["userApps"] });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search your apps..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            All Apps
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            Recent
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {safeData.map((app) => (
          <AppCard 
            key={app.id}
            id={app.id}
            name={app.name}
            createdAt={app.createdAt}
            onDelete={onAppDeleted}
          />
        ))}
      </div>

      {/* Empty State */}
      {safeData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps yet</h3>
          <p className="text-gray-600 mb-4">Create your first AI-powered application to get started.</p>
          <button 
            onClick={() => document.getElementById('app-generator')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First App
          </button>
        </div>
      )}
    </div>
  );
}
