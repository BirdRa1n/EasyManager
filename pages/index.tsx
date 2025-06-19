import { Card, CardBody } from "@heroui/react";

import AuthForm from "@/components/forms/auth";
import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useRouter } from "next/router";
import React from "react";

import { useUser } from "@/contexts/user";

export default function IndexPage() {
  const { user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-2 py-8 md:py-10 md:flex-row ">
        <div className="inline-block max-w-xl text-center justify-center md:order-first">
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

        <div className="flex flex-col w-[340px]">
          <Card className="max-w-full">
            <CardBody className="overflow-hidden">
              <AuthForm />
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
