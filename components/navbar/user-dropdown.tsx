import { useUser } from "@/contexts/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { NavbarItem } from "@heroui/navbar";
import { User } from "@heroui/react";
import { useCallback } from "react";

export const UserDropdown = () => {
  const { signOut, user } = useUser();

  const handleLogout = useCallback(async () => {
    if (signOut) {
      await signOut();
    }
  }, []);

  return (
    <Dropdown radius="sm">
      <NavbarItem>
        <DropdownTrigger>
          <User
            avatarProps={{
              src: user?.user_metadata?.avatar_url || "",
            }}
            description={user?.email || ""}
            name={`${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`}
          />
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu
        closeOnSelect={false}
        aria-label='User menu actions'
        onAction={(actionKey) => console.log({ actionKey })}>
        <DropdownItem
          key='profile'
          className='flex flex-col justify-start w-full items-start'>
          <p>Você está logado</p>
          <p>{user?.email}</p>
        </DropdownItem>
        <DropdownItem key='settings'>Minha Conta</DropdownItem>
        <DropdownItem key='team_settings'>Equipe</DropdownItem>
        <DropdownItem key='system'>Sistema</DropdownItem>
        <DropdownItem key='configurations'>Configurações</DropdownItem>
        <DropdownItem key='help_and_feedback'>Ajuda & Feedback</DropdownItem>
        <DropdownItem
          key='logout'
          color='danger'
          className='text-danger'
          onPress={handleLogout}>
          Sair
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
