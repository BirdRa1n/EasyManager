"use client";
import usePrimaryColor from "@/constants/Colors";
import { useUser } from "@/contexts/user";
import { Spinner } from "@heroui/react";
import React, { useEffect, useState } from "react";
import { AcmeIcon } from "../icons/acme-icon";
import { BottomIcon } from "../icons/sidebar/bottom-icon";

interface Company {
  name: string;
  location: string;
  logo: React.ReactNode;
}

export const CompaniesDropdown = () => {
  const { team } = useUser();
  const [loading, setLoading] = useState(true);
  const primaryColor = usePrimaryColor();

  useEffect(() => {
    if (team) {
      setLoading(false);
      setCompany({
        name: team.name || "Team Example",
        location: team.location || "Palo Alto, CA",
        logo: team.logo ? <img src={team.logo} alt="Company Logo" className="w-8 h-8 rounded-full" /> : <AcmeIcon />,
      });
    }
  }, [team]);

  const [company, setCompany] = useState<Company>({
    name: "Team Exemple",
    location: "Palo Alto, CA",
    logo: <AcmeIcon />,
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
      <div className="flex flex-col gap-4">
        <h3 className="text-md font-medium m-0 text-default-900 -mb-4 whitespace-nowrap truncate max-w-[180px]">
          {company.name}
        </h3>
        <span className="text-xs font-medium text-default-500">
          {company.location}
        </span>
      </div>
      <BottomIcon />
    </div>
  );
};
