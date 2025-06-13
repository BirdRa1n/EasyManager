import { useProducts } from "@/contexts/products";
import { useTeam } from "@/contexts/team";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { FaMoneyBill, FaStore, FaUsers } from "react-icons/fa6";
import { LuPackageSearch } from "react-icons/lu";
import { TbReport } from "react-icons/tb";


export default function Home() {
    const { products } = useProducts();
    const { members, stores } = useTeam();
    return (
        <div className="w-full h-full flex flex-col p-4 mt-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 flex-grow ">
                {/* Coluna Esquerda */}
                <div className="flex flex-col gap-4 lg:max-h-[86.5vh]">
                    <div className="grid grid-cols-2 gap-2">
                        <Card radius="sm" className="flex flex-col justify-between">
                            <CardBody>
                                <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center mb-4">
                                    <TbReport />
                                </div>
                                <p>Serviços</p>
                                <p className="text-2xl font-bold">{0}</p>
                            </CardBody>
                        </Card>
                        <Card radius="sm" className="flex flex-col justify-between">
                            <CardBody>
                                <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center mb-4">
                                    <LuPackageSearch />
                                </div>
                                <p>Produtos</p>
                                <p className="text-2xl font-bold">{products.length || 0}</p>
                            </CardBody>
                        </Card>
                    </div>

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

                    <Card radius="sm" className="flex-grow flex flex-col">
                        <CardBody className="flex flex-col flex-grow justify-between">
                            <div className="flex items-center justify-start mb-4 flex-grow">
                                <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center">
                                    <FaStore />
                                </div>
                            </div>
                            <div>
                                <p>Lojas</p>
                                <p className="text-2xl font-bold">
                                    {stores.length || 0}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card radius="sm" className="flex-grow flex flex-col">
                        <CardBody className="flex flex-col flex-grow justify-between">
                            <div className="flex items-center justify-start mb-4 flex-grow">
                                <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center">
                                    <FaMoneyBill />
                                </div>
                            </div>
                            <div>
                                <p>Vendas</p>
                                <p className="text-2xl font-bold">
                                    {0}
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Coluna Direita */}
                <div className="flex flex-col flex-grow lg:max-h-[86.5vh]">
                    <Card radius="sm" className="flex-grow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <p></p>
                            </div>
                        </CardHeader>
                        <CardBody className="flex flex-col flex-grow">
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};