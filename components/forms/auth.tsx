import { supabase } from "@/supabase/client";
import { addToast, Button, Input, Link, Tab, Tabs } from "@heroui/react";
import React from "react";

const AuthForm = () => {
    const [selected, setSelected] = React.useState<React.Key | null>("login");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            addToast({
                title: "Erro ao fazer login",
                description: error.message,
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (data?.user) {
            addToast({
                title: "Login realizado com sucesso!",
                description: "Você será redirecionado para o dashboard.",
                color: "success",
                timeout: 3000,
                onClose: () => {
                    window.location.href = "/dashboard";
                }
            });
        }
    };

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            addToast({
                title: "Erro",
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
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (data?.user) {
            addToast({
                title: "Conta criada com sucesso!",
                description: "Verifique seu email para ativar sua conta.",
                color: "success",
                timeout: 3000
            });
            setSelected("login");
        }
    };

    return (
        <Tabs
            fullWidth
            aria-label="Tabs form"
            //@ts-ignore
            selectedKey={selected}
            size="md"
            onSelectionChange={setSelected}
        >
            <Tab key="login" title="Entrar">
                <form className="flex flex-col gap-4">
                    <Input isRequired label="Email" placeholder="Digite seu email" type="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    <Input
                        isRequired
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Senha"
                        placeholder="Digite sua senha"
                        type="password"
                    />
                    <p className="text-center text-small">
                        Ainda não tem conta?{" "}
                        <Link size="sm" onPress={() => setSelected("sign-up")}>
                            Clique aqui
                        </Link>
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button fullWidth color="primary" onPress={handleLogin}>
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
                        value={password}
                    />
                    <p className="text-center text-small">
                        Já tem uma conta?{" "}
                        <Link size="sm" onPress={() => setSelected("login")}>
                            Clique aqui
                        </Link>
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button fullWidth color="primary" onPress={handleSignUp}>
                            Cadastrar
                        </Button>
                    </div>
                </form>
            </Tab>
        </Tabs>
    )
};

export default AuthForm;