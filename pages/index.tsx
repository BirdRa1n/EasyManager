import { Card, CardBody } from "@heroui/react";

import AuthForm from "@/components/forms/auth";
import { subtitle, title } from "@/components/primitives";
import { useUser } from "@/contexts/user";
import DefaultLayout from "@/layouts/default";
import React from "react";

export default function IndexPage() {
  const { user } = useUser();

  React.useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  return (
    <DefaultLayout>
      <section className="flex flex-row items-start justify-center gap-2 py-8 md:py-10">
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
              <AuthForm />
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
