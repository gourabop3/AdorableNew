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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('UserApps error:', error);
    return (
      <div className="px-4 sm:px-8">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Unable to load your apps. Please try refreshing the page.
        </p>
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="px-4 sm:px-8">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          You haven't created any apps yet. Create your first app above!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-8">
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
  );
}
