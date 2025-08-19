import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

const authSchema = z.object({
  identificador: z.string().min(3, "Digite seu email ou telefone"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  telefone: z.string().min(8, "Telefone obrigatório"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "register";
}

const AuthDialog = ({ open, onOpenChange, mode }: AuthDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(mode === "register" ? registerSchema : authSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      identificador: "",
      senha: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let result;
      if (mode === "register") {
        result = await signUp(data.nome || "", data.telefone || "", data.senha);
      } else {
        // data.identificador pode ser email ou telefone
        result = await signIn(data.identificador, data.senha);
      }

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error.message || "Não foi possível completar a ação.",
        });
      } else {
        toast({
          title: mode === "register" ? "Cadastro realizado!" : "Login realizado!",
          description: mode === "register"
            ? "Use seu telefone e senha para entrar."
            : "Bem-vindo de volta!",
        });
        onOpenChange(false);
      }
    } catch (err: any) {
      toast({
        title: "Erro inesperado",
        description: err?.message || "Verifique sua conexão e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLogin ? "Entrar" : "Criar conta"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Faça login com email ou telefone e sua senha."
              : "Preencha seu nome, telefone e crie uma senha."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite seu nome" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isLogin && (
              <FormField
                control={form.control}
                name="identificador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email ou Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com ou (11) 99999-9999" 
                        type="text"
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!isLogin && (
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Digite sua senha" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
