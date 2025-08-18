import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "./AuthDialog";
import useAuth from "@/hooks/useAuth";

const Header = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Novo logotipo responsivo centralizado */}
        <div className="flex items-center">
          <img 
            src="/Background La Vie (9).png" 
            alt="La Vie" 
            className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
          />
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                Meus Bombons
              </Button>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/admin'}
                >
                  Admin
                </Button>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Olá, {user.user_metadata?.nome || user.email}
                {isAdmin && " (Admin)"}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenAuth("login")}
              >
                Entrar
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleOpenAuth("register")}
              >
                Cadastrar
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthDialog 
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        mode={authMode}
      />
    </header>
  );
};

export default Header;
