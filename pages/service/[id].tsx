import { Input } from "@heroui/input";
import { Card, CardBody, Image, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea } from "@heroui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ServiceDetail = () => {
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState<any>(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            console.log("ID carregado:", id); // log útil
            fetchServiceDetails(id as string);
        }
    }, [id]);

    const fetchServiceDetails = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/service/${id}`); // corrigido com `/`
            const data = response.data;
            setService(data);
        } catch (error) {
            console.error("Erro ao buscar detalhes do serviço:", error);
            setService(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <>
            <div className="flex items-center justify-center h-screen">
                <Spinner size="md" />
            </div>
        </>;
    }

    if (!service) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Detalhes do serviço não encontrados.</p>
            </div>
        );
    }

    return (
        <>
            <section className="flex flex-col gap-4 p-10 mt-5 align-center items-center">
                <div className="w-full">
                    <Card>
                        <CardBody className="grid grid-cols-2 sm:grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <div>
                                <h1 className="font-bold text-lg mb-4">Informações do serviço</h1>
                                <Input label="Serviço" value={service.name} readOnly description="Serviço realizado" />
                                <Textarea label="Detalhes" value={service.description} readOnly description="Detalhes do serviço" />
                                <Input label="Preço" value={service.price} readOnly description="Preço do serviço" />
                                <Input label="Status" value={service.status} readOnly description="Status do serviço" />
                            </div>

                            {service?.attachments && (
                                <div>
                                    <h1 className="font-bold text-lg mb-4">Anexos</h1>
                                    <Table removeWrapper aria-label="Anexos" >
                                        <TableHeader>
                                            <TableColumn>ARQUIVO</TableColumn>
                                            <TableColumn align="end">AÇÕES</TableColumn>
                                        </TableHeader>
                                        <TableBody >
                                            {service?.attachments.map((item: any, index: number) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Image className="max-w-[100px] max-h-[100px] rounded-md" src={item.file} alt={`Attachment ${index}`} />
                                                    </TableCell>
                                                    <TableCell>Active</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </section>
        </>
    );

};

export default ServiceDetail;
