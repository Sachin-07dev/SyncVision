import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - will be replaced with real data from backend
  const recentBoards = [
    {
      id: 1,
      name: "Project Planning",
      lastEdited: "2 hours ago",
      participants: 5,
      thumbnail: "bg-gradient-to-br from-primary/20 to-secondary/20",
    },
    {
      id: 2,
      name: "Math Tutoring Session",
      lastEdited: "1 day ago",
      participants: 2,
      thumbnail: "bg-gradient-to-br from-secondary/20 to-primary/20",
    },
    {
      id: 3,
      name: "Design Brainstorm",
      lastEdited: "3 days ago",
      participants: 8,
      thumbnail: "bg-gradient-to-br from-primary/30 to-secondary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Boards</h1>
              <p className="text-muted-foreground">
                Manage your collaborative workspaces
              </p>
            </div>
            <Link to="/whiteboard">
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                New Board
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Boards</p>
                    <p className="text-3xl font-bold">12</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Collaborators</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Hours This Week</p>
                    <p className="text-3xl font-bold">8.5</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Boards */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Boards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBoards.map((board) => (
                <Link key={board.id} to="/whiteboard">
                  <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:shadow-glow group cursor-pointer">
                    <CardContent className="p-0">
                      <div className={`${board.thumbnail} h-40 rounded-t-lg`} />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {board.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{board.participants} participants</span>
                          </div>
                          <span>{board.lastEdited}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Dashboard;
