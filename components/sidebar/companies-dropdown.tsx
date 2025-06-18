"use client";
import usePrimaryColor from "@/constants/Colors";
import { useTeam } from "@/contexts/team";
import { Avatar, Spinner } from "@heroui/react";
import React, { useEffect, useState } from "react";
import { IoLayersOutline } from "react-icons/io5";

interface Company {
  name: string;
  location: string;
  logo: React.ReactNode;
}

export const CompaniesDropdown = () => {
  const { team } = useTeam();
  const [loading, setLoading] = useState(true);
  const primaryColor = usePrimaryColor();

  useEffect(() => {
    if (team) {
      setLoading(false);
      setCompany({
        name: team.name || "Team Example",
        location: team.location || "Palo Alto, CA",
        logo: <Avatar src={team.logo} color="primary" fallback={<IoLayersOutline className="text-2xl text-ehite" />} radius="sm" alt="Company Logo" />,
      });
    }
  }, [team]);

  const [company, setCompany] = useState<Company>({
    name: "Team Exemple",
    location: "Palo Alto, CA",
    logo: <Avatar size="sm" color="primary" />,
  });

  if (loading || !team) {
    return (
      <div className="flex items-center gap-2 mr-1 min-h-[40px]">
        <Spinner size="sm" color={primaryColor} />
        <span className="text-xs font-medium text-default-500">
          {"Carregando..."}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 mr-1">
      {company.logo}
      <div className="flex flex-col gap-4">
        <h3 className="text-md font-medium m-0 text-default-900 -mb-4 whitespace-nowrap truncate max-w-[180px]">
          {company.name}
        </h3>
        <span className="text-xs font-medium text-default-500">
          {company.location}
        </span>
      </div>
    </div>
  );
};
