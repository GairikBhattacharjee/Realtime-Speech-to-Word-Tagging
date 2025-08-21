import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Mic, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SpeakTagStudio</span>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
              v1.0
            </Badge>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/app" className="text-muted-foreground hover:text-foreground transition-colors">
              Speech App
            </Link>
            <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#api" className="text-muted-foreground hover:text-foreground transition-colors">
              API
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Link to="/app">
              <Button size="sm" className="bg-primary hover:bg-primary-glow">
                Get Started
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;