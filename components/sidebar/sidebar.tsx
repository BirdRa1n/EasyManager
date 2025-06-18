import { useSidebarContext } from "@/layouts/layout-context";
import { FaBuilding, FaStore } from "react-icons/fa6";
import { CustomersIcon } from "../icons/sidebar/customers-icon";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PaymentsIcon } from "../icons/sidebar/payments-icon";
import { ProductsIcon } from "../icons/sidebar/products-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CompaniesDropdown } from "./companies-dropdown";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { Sidebar } from "./sidebar.styles";

export const SidebarWrapper = () => {
  const { collapsed, setCollapsed, sidebarActiveItem, setSidebarActiveItem } = useSidebarContext();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={() => setCollapsed(false)} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <CompaniesDropdown />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="Início"
              icon={<HomeIcon />}
              isActive={sidebarActiveItem === "home"}
              onClick={() => { setSidebarActiveItem("home") }}
            />
            <SidebarMenu title="Geral">
              <SidebarItem
                isActive={sidebarActiveItem === "members"}
                title="Equipe"
                icon={<CustomersIcon />}
                onClick={() => { setSidebarActiveItem("members") }}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "products"}
                title="Produtos"
                onClick={() => { setSidebarActiveItem("products") }}
                icon={<ProductsIcon />}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "services"}
                onClick={() => { setSidebarActiveItem("services") }}
                title="Serviços"
                icon={<ReportsIcon />}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "stores"}
                onClick={() => { setSidebarActiveItem("stores") }}
                title="Lojas"
                icon={<FaStore className="fill-default-400 text-[24px] ml-0" />}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "suppliers"}
                onClick={() => { setSidebarActiveItem("suppliers") }}
                title="Fornecedores"
                icon={<FaBuilding className="fill-default-400 min-h-[24px] min-w-24px] ml-1" />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Relatórios">
              <SidebarItem
                isActive={sidebarActiveItem === "payments"}
                onClick={() => { setSidebarActiveItem("payments") }}
                title="Vendas"
                icon={<PaymentsIcon />}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "reports"}
                onClick={() => { setSidebarActiveItem("reports") }}
                title="Relatórios"
                icon={<ReportsIcon />}
              />
            </SidebarMenu>

            <SidebarMenu title="Opções">
              <SidebarItem
                isActive={sidebarActiveItem === "settings"}
                onClick={() => { setSidebarActiveItem("settings") }}
                title="Configurações"
                icon={<SettingsIcon />}
              />
            </SidebarMenu>
            <div className="mt-5" />
          </div>

        </div>
      </div>
    </aside>
  );
};
