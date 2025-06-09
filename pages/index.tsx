import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Tabs, Tab, Input, Button, Card, CardBody } from "@heroui/react";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import React from "react";

export default function IndexPage() {
  const [selected, setSelected] = React.useState<React.Key | null>("login");

  return (
    <DefaultLayout>
      <section className="flex flex-row items-start justify-center gap-0 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Organize&nbsp;</span>
          <span className={title({ color: "blue" })}>seu negócio&nbsp;</span>
          <br />
          <span className={title()}>
            com o poder do EasyManager.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Gerencie organizações, lojas, estoques, produtos e fornecedores com segurança e escalabilidade.
          </div>
        </div>

        <div className="flex flex-col">
          <Card className="max-w-full w-[340px]">
            <CardBody className="overflow-hidden">
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
                    <Input isRequired label="Email" placeholder="Digite seu email" type="email" />
                    <Input
                      isRequired
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
                      <Button fullWidth color="primary">
                        Entrar
                      </Button>
                    </div>
                  </form>
                </Tab>
                <Tab key="sign-up" title="Cadastrar">
                  <form className="flex flex-col gap-4 h-[300px]">
                    <Input isRequired label="Nome" placeholder="Digite seu nome" />
                    <Input isRequired label="Email" placeholder="Digite seu email" type="email" />
                    <Input
                      isRequired
                      label="Senha"
                      placeholder="Crie uma senha"
                      type="password"
                    />
                    <p className="text-center text-small">
                      Já tem uma conta?{" "}
                      <Link size="sm" onPress={() => setSelected("login")}>
                        Clique aqui
                      </Link>
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button fullWidth color="primary">
                        Cadastrar
                      </Button>
                    </div>
                  </form>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
