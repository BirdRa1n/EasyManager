import { useSidebarContext } from "@/layouts/layout-context";
import { Input } from "@heroui/input";
import { Navbar, NavbarContent } from "@heroui/navbar";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import React from "react";
import { SearchIcon } from "../icons/searchicon";
import { BurguerButton } from "./burguer-button";
import { DarkModeSwitch } from "./darkmodeswitch";
import { NotificationsDropdown } from "./notifications-dropdown";
import { UserDropdown } from "./user-dropdown";

interface Props {
  children: React.ReactNode;
}

export const NavbarWrapper = ({ children }: Props) => {
  const { sidebarActiveItem } = useSidebarContext();

  const filterName = () => {
    switch (sidebarActiveItem) {
      case "home":
        return "Início";
      case "members":
        return "Equipe";
      case "products":
        return "Produtos";
      case "payments":
        return "Pagamentos";
      case "services":
        return "Serviços";
      case "reports":
        return "Relatórios";
      case "settings":
        return "Configurações";
      case "suppliers":
        return "Fornecedores";
      case "stores":
        return "Lojas";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      <Navbar
        isBordered
        className="w-full z-[50]" // Reduzido de z-[100] para ficar abaixo dos modais
        classNames={{
          wrapper: "w-full max-w-full",
        }}
      >
        <NavbarContent className="md:hidden">
          <BurguerButton />
        </NavbarContent>
        <NavbarContent className="w-full max-md:hidden">
          <Breadcrumbs>
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
            <BreadcrumbItem>{filterName()}</BreadcrumbItem>
          </Breadcrumbs>
          <Input
            startContent={<SearchIcon />}
            isClearable
            radius="md"
            className="w-full hidden"
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Pesquisar..."
          />
        </NavbarContent>
        <NavbarContent
          justify="end"
          className="w-fit data-[justify=end]:flex-grow-0"
        >
          <NotificationsDropdown />
          <DarkModeSwitch />
          <NavbarContent>
            <UserDropdown />
          </NavbarContent>
        </NavbarContent>
      </Navbar>
      {children}
    </div>
  );
};