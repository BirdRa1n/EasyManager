import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@heroui/dropdown";

import React from "react";
import { NotificationIcon } from "../icons/navbar/notificationicon";
import { NavbarItem } from "@heroui/navbar";

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <NavbarItem>
          <NotificationIcon />
        </NavbarItem>
      </DropdownTrigger>
      <DropdownMenu className="w-80" aria-label="Avatar Actions">
        <DropdownSection title="Notificações">
          <>
            {notifications.map((notification) => (
              <DropdownItem
                key={notification.id}
                classNames={{
                  base: "py-2",
                  title: "text-base font-semibold",
                }}
                description={notification.description}
              >
                {notification.title}
              </DropdownItem>
            ))}
          </>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
