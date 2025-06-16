import { useProducts } from "@/contexts/products";
import { useServices } from "@/contexts/services";
import { useTeam } from "@/contexts/team";
import { Service } from "@/types/services";
import { Card, CardBody } from "@heroui/react";
import React from "react";
import { FaUsers } from "react-icons/fa6";
import { TbReport, TbReportMoney } from "react-icons/tb";
import { LastMonthServices } from "./charts/last-services";

export default function Home() {
    const [servicesPanding, setServicesPanding] = React.useState<Service[]>([]);
    const [servicesCompleted, setServicesCompleted] = React.useState<Service[]>([]);
    const { products } = useProducts();
    const { members, stores } = useTeam();
    const { services } = useServices();

    React.useEffect(() => {
        const pendingServices = services.filter((service) => service.status === "pending");
        const completedServices = services.filter((service) => service.status === "completed");
        setServicesPanding(pendingServices);
        setServicesCompleted(completedServices);
    }, [services]);
    return (
        <div className="w-full h-full flex flex-col p-4 mt-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 flex-grow ">
                {/* Coluna Esquerda */}
                <div className="flex flex-col gap-4 lg:max-h-[86.5vh]">
                    <Card className="min-h-[462px">
                        <LastMonthServices selectedStatus="completed" />
                    </Card>
                    <div className="grid grid-cols-2 gap-2">
                        <Card radius="sm" className="flex flex-col justify-between">
                            <CardBody>
                                <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center mb-4">
                                    <TbReportMoney />
                                </div>
                                <p>Serviços Finalizados</p>
                                <p className="text-2xl font-bold">{servicesCompleted.length || 0}</p>
                            </CardBody>
                        </Card>
                        <Card radius="sm" className="flex flex-col justify-between">
                            <CardBody>
                                <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center mb-4">
                                    <TbReport />
                                </div>
                                <p>Serviços Pendentes</p>
                                <p className="text-2xl font-bold">{servicesPanding.length || 0}</p>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Coluna Direita */}
                <div className="flex flex-col flex-grow lg:max-h-[86.5vh]">
                    <Card radius="sm">
                        <CardBody>
                            <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center">                                <FaUsers />
                            </div>
                            <p>Membros</p>
                            <p className="text-2xl font-bold">
                                {(members?.length ?? 0)}
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};