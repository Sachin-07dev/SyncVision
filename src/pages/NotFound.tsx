import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
          <span className="text-4xl font-bold">404</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button className="bg-gradient-primary shadow-glow gap-2">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
