"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon, SparklesIcon } from "lucide-react";
import { CodeReview } from "@/lib/ai-code-review";

interface CodeReviewPanelProps {
  review: CodeReview | null;
  isLoading: boolean;
  onRunReview: () => void;
}

const severityIcons = {
  low: <InfoIcon className="w-4 h-4" />,
  medium: <AlertTriangleIcon className="w-4 h-4" />,
  high: <XCircleIcon className="w-4 h-4" />,
  critical: <XCircleIcon className="w-4 h-4" />
};

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const typeColors = {
  security: "bg-red-50 border-red-200",
  performance: "bg-orange-50 border-orange-200",
  style: "bg-blue-50 border-blue-200",
  bug: "bg-purple-50 border-purple-200",
  optimization: "bg-green-50 border-green-200"
};

export function CodeReviewPanel({ review, isLoading, onRunReview }: CodeReviewPanelProps) {
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Code Review</CardTitle>
          </div>
          <Button 
            onClick={onRunReview} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? "Analyzing..." : "Run Review"}
          </Button>
        </div>
        <CardDescription>
          Comprehensive code quality analysis powered by AI
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!review && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Click "Run Review" to analyze your code</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI is analyzing your code...</p>
          </div>
        )}

        {review && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Issues ({review.issues.length})</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(review.overallScore)}`}>
                      {review.overallScore}/10
                    </div>
                    <p className="text-gray-600 mt-2">Overall Code Quality Score</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  review.issues.reduce((acc, issue) => {
                    acc[issue.type] = (acc[issue.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <Card key={type} className={typeColors[type as keyof typeof typeColors]}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm capitalize">{type}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {review.issues.map((issue, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all ${
                    selectedIssue === index ? 'ring-2 ring-purple-500' : ''
                  } ${typeColors[issue.type]}`}
                  onClick={() => setSelectedIssue(selectedIssue === index ? null : index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {severityIcons[issue.severity]}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={severityColors[issue.severity]}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {issue.type}
                            </Badge>
                            {issue.line && (
                              <Badge variant="secondary">
                                Line {issue.line}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium mb-1">{issue.message}</p>
                          
                          {selectedIssue === index && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-1">Suggestion:</h5>
                                <p className="text-sm text-gray-600">{issue.suggestion}</p>
                              </div>
                              {issue.example && (
                                <div>
                                  <h5 className="font-medium text-sm text-gray-700 mb-1">Example:</h5>
                                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                    {issue.example}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="strengths" className="space-y-3">
              {review.strengths.map((strength, index) => (
                <Card key={index} className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <p className="text-green-800">{strength}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-3">
              {review.recommendations.map((recommendation, index) => (
                <Card key={index} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-blue-800">{recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}