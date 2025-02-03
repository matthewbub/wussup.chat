"use client";
import { createClient } from "@/lib/supabase-client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Layout, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

async function getDashboardData() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_user_dashboard_data");
  if (error) throw error;
  return data;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-black mb-2">
              Welcome to {dashboardData?.[0]?.client_name}
            </h1>
            <p className="text-gray-800">
              Manage your teams and projects from one place
            </p>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData &&
              dashboardData?.map((team) => (
                <div
                  key={team.team_id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-black">
                      {team.team_name}
                    </h2>
                    <span className="text-sm text-gray-800">
                      {team.board_count} boards
                    </span>
                  </div>

                  {/* Recent Boards */}
                  <div className="space-y-2">
                    {team.recent_boards.map((board: any) => (
                      <Link
                        href={`/board/${board.id}`}
                        key={board.id}
                        className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/15 transition-colors"
                      >
                        <Layout className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-gray-900">{board.title}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Create Board Button */}
                  <Button
                    variant="ghost"
                    className="w-full border border-white/20 hover:bg-white/10 text-black"
                    asChild
                  >
                    <Link href={`/team/${team.team_id}/new-board`}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      New Board
                    </Link>
                  </Button>
                </div>
              ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-purple-400 mr-2" />
              <h2 className="text-xl font-semibold text-black">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-2">
              {/* We can add recent activity items here */}
              <p className="text-gray-800 text-sm">
                Activity feed coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
