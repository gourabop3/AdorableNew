"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Trash, ExternalLink, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";

type AppCardProps = {
  id: string;
  name: string;
  createdAt: Date;
  onDelete?: () => void;
};

export function AppCard({ id, name, createdAt, onDelete }: AppCardProps) {
  const router = useRouter();

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/app/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteApp(id);
    toast.success("App deleted successfully");
    if (onDelete) {
      onDelete();
    }

    console.log(`Delete app: ${id}`);
  };

  return (
    <Card className="bg-white hover:shadow-xl transition-all duration-200 cursor-pointer group border border-gray-200 hover:border-blue-300 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {name}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Created {createdAt.toLocaleDateString()}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
          <button
            onClick={handleOpen}
            className="h-8 w-8 p-0 rounded-md hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 p-0 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpen}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open App
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* App Preview Placeholder */}
      <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">App Preview</p>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
        <span className="text-xs text-gray-400">1 credit used</span>
      </div>
    </Card>
  );
}
