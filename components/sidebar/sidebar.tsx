import { useSidebarContext } from "@/layouts/layout-context";
import { FaMicrochip } from "react-icons/fa6";
import { CustomersIcon } from "../icons/sidebar/customers-icon";
import { HomeIcon } from "../icons/sidebar/home-icon";
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
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
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
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={sidebarActiveItem === "members"}
                title="Equipe"
                icon={<CustomersIcon />}
                onClick={() => { setSidebarActiveItem("members") }}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "devices"}
                title="Dispositivos"
                onClick={() => { setSidebarActiveItem("devices") }}
                icon={<FaMicrochip className="fill-default-400 min-h-[44px] min-w-[22px] mr-0.4" />}
              />
              <SidebarItem
                isActive={sidebarActiveItem === "requests"}
                onClick={() => { setSidebarActiveItem("requests") }}
                title="Solicitações"
                icon={<ReportsIcon />}
              />
            </SidebarMenu>

            <SidebarMenu title="General">
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
