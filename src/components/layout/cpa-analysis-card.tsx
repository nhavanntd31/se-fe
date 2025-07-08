"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";
import { StatisticResponse } from "@/services/statistic.service";

interface CPAAnalysisCardProps {
  statistics: StatisticResponse | null;
  title?: string;
  scope?: string;
}

export function CPAAnalysisCard({ 
  statistics, 
  title = "Điểm trung bình CPA theo kì",
  scope = "Trường"
}: CPAAnalysisCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <LineChart data={
          statistics?.averageCPA?.map(item => ({
            semester: item.semester,
            gpa: item.averageCPA,
            cpa: item.averageCPA
          })) || []
        } />

      </CardContent>
    </Card>
  );
} 