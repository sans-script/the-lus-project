"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LusLogo } from "@/components/ui/lus-logo";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register, isLoading } = useAuth();
  const router = useRouter();
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success("Login realizado com sucesso!");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer login",
      );
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Cadastro realizado com sucesso!");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar usuário",
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary rounded-lg">
            <LusLogo
              className="h-6 w-6 text-primary-foreground"
              width={20}
              height={20}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">LUS</h1>
            <p className="text-xs text-muted-foreground">
              Localizador de Unidades de Saúde
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-4 h-96">
        <Card className="border shadow-lg w-full max-w-md">
          <CardHeader className="space-y-1 text-center pb-3">
            <CardTitle className="text-xl text-foreground">Bem-vindo</CardTitle>
            <CardDescription className="text-xs px-2">
              Faça login ou crie sua conta para acessar o localizador
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2 pt-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="text-sm">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="text-sm">
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              <div
                className="relative transition-all duration-300 ease-in-out"
                style={{ minHeight: 420, height: 420 }}
              >
                <TabsContent
                  value="login"
                  className="space-y-4 m-0 h-full absolute inset-0 data-[state=active]:block data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto px-1">
                      <Form {...loginForm}>
                        <div className="space-y-2">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="seu@email.com"
                                      className={`pl-10 ${loginForm.formState.errors.email ? "border-red-400 dark:border-red-400 focus:border-red-400 dark:focus:border-red-400 focus:!ring-red-400 dark:focus:!ring-red-400" : ""}`}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Sua senha"
                                      className={`pl-10 pr-10 ${loginForm.formState.errors.password ? "border-red-400 dark:border-red-400 focus:border-red-400 dark:focus:border-red-400 focus:!ring-red-400 dark:focus:!ring-red-400" : ""}`}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>

                      <div className="flex items-center justify-center py-8">
                        <div className="p-6 bg-primary/10 rounded-3xl relative overflow-hidden animate-pulse">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-pulse rounded-3xl"></div>
                          <LusLogo
                            className="h-24 w-24 text-primary relative z-10 drop-shadow-2xl animate-pulse"
                            width={96}
                            height={96}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={isLoading}
                        onClick={loginForm.handleSubmit(onLoginSubmit)}
                      >
                        {isLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="register"
                  className="space-y-3 m-0 h-full absolute inset-0 data-[state=active]:block data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto px-1">
                      <Form {...registerForm}>
                        <div className="space-y-2">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome completo</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Seu nome completo"
                                      className={`pl-10 ${registerForm.formState.errors.name ? "border-red-400 dark:border-red-400 focus:border-red-400 dark:focus:border-red-400 focus:!ring-red-400 dark:focus:!ring-red-400" : ""}`}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="seu@email.com"
                                      className={`pl-10 ${registerForm.formState.errors.email ? "border-red-400 dark:border-red-400 focus:border-red-400 dark:focus:border-red-400 focus:!ring-red-400 dark:focus:!ring-red-400" : ""}`}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Sua senha"
                                      className={`pl-10 pr-10 ${registerForm.formState.errors.password ? "border-red-400 dark:border-red-400 focus:border-red-400 dark:focus:border-red-400 focus:!ring-red-400 dark:focus:!ring-red-400" : ""}`}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type={
                                        showConfirmPassword
                                          ? "text"
                                          : "password"
                                      }
                                      placeholder="Confirme sua senha"
                                      className={`pl-10 pr-10 ${registerForm.formState.errors.confirmPassword ? "border-red-400 dark:border-red-400 focus:border-red-400 dark:focus:border-red-400 focus:!ring-red-400 dark:focus:!ring-red-400" : ""}`}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword,
                                        )
                                      }
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>
                    </div>

                    <div className="mt-auto pt-2">
                      <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={isLoading}
                        onClick={registerForm.handleSubmit(onRegisterSubmit)}
                      >
                        {isLoading ? "Criando conta..." : "Criar conta"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{" "}
                <a href="#" className="underline hover:text-primary">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="underline hover:text-primary">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
