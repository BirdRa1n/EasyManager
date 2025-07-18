import { supabase } from "@/supabase/client";
import { addToast, Button, Input, Link, Tab, Tabs } from "@heroui/react";
import React from "react";

const AuthForm = () => {
    const [selected, setSelected] = React.useState<React.Key | null>("login");
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");

    const handleLogin = async () => {
        setIsLoading(true);

        try {
            if (!email || !password) {
                addToast({
                    title: "Erro",
                    variant: "solid",
                    description: "Por favor, preencha todos os campos.",
                    color: "danger",
                    timeout: 3000,
                });
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                addToast({
                    title: "Erro ao fazer login",
                    description: error.message,
                    color: "danger",
                    variant: "solid",
                    timeout: 3000,
                });
                return;
            }

            if (data?.user) {
                addToast({
                    title: "Login realizado com sucesso!",
                    description: "Você será redirecionado para o dashboard.",
                    variant: "solid",
                    color: "primary",
                    timeout: 3000,
                    shouldShowTimeoutProgress: true,
                    promise: new Promise(() => setTimeout(window.location.href = "/dashboard", 3000))
                });
            }
        } catch (error) {
            console.error(error);
            addToast({
                title: "Erro ao fazer login",
                description: "Algo deu errado. Tente novamente mais tarde.",
                color: "danger",
                variant: "solid",
                timeout: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setIsLoading(true);

        try {
            if (!name || !email || !password) {
                addToast({
                    title: "Erro",
                    variant: "solid",
                    description: "Por favor, preencha todos os campos.",
                    color: "danger",
                    timeout: 3000,
                });
                return;
            }

            const first_name = name.split(" ")[0];
            const last_name = name.split(" ").slice(1).join(" ") || "";

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'https://easymanager.birdra1n.com/dashboard',
                    data: {
                        first_name,
                        last_name
                    },
                },
            });

            if (error) {
                addToast({
                    title: "Erro ao criar conta",
                    description: error.message,
                    variant: "solid",
                    color: "danger",
                    timeout: 3000,
                });
                return;
            }

            if (data?.user) {
                addToast({
                    title: "Conta criada com sucesso!",
                    description: "Verifique seu email para ativar sua conta.",
                    variant: "solid",
                    color: "primary",
                    timeout: 3000
                });
                setSelected("login");
            }
        } catch (error) {
            console.error(error);
            addToast({
                title: "Erro ao criar conta",
                description: "Algo deu errado. Tente novamente mais tarde.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Tabs
            fullWidth
            aria-label="Tabs form"
            color="default"
            //@ts-ignore
            selectedKey={selected}
            size="md"
            onSelectionChange={setSelected}
        >
            <Tab key="login" title="Login">
                <form className="flex flex-col gap-4">
                    <Input isRequired label="Email" placeholder="Digite seu email" type="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    <Input
                        isRequired
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Senha"
                        placeholder="Digite sua senha"
                        type="password"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleLogin();
                            }
                        }}
                    />
                    <p className="text-center text-small">
                        Ainda não tem conta?{" "}
                        <Link size="sm" onPress={() => setSelected("sign-up")}>
                            Clique aqui
                        </Link>
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button fullWidth color="primary" onPress={handleLogin} isLoading={isLoading}>
                            Entrar
                        </Button>
                    </div>
                </form>
            </Tab>
            <Tab key="sign-up" title="Cadastrar">
                <form className="flex flex-col gap-4 h-[300px]">
                    <Input isRequired label="Nome" placeholder="Digite seu nome" onChange={(e) => setName(e.target.value)} value={name} />
                    <Input isRequired label="Email" placeholder="Digite seu email" type="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    <Input
                        isRequired
                        label="Senha"
                        placeholder="Crie uma senha"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSignUp();
                            }
                        }}
                        value={password}
                    />
                    <p className="text-center text-small">
                        Já tem uma conta?{" "}
                        <Link size="sm" onPress={() => setSelected("login")}>
                            Clique aqui
                        </Link>
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button fullWidth color="primary" onPress={handleSignUp} isLoading={isLoading}>
                            Cadastrar
                        </Button>
                    </div>
                </form>
            </Tab>
        </Tabs>
    )
};

export default AuthForm;