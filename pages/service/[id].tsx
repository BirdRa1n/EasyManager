import { Input } from "@heroui/input";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Image,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea
} from "@heroui/react";
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
            fetchServiceDetails(id as string);
        }
    }, [id]);

    const fetchServiceDetails = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/service/${id}`);
            setService(response.data);
        } catch (error) {
            console.error("Erro ao buscar detalhes do serviço:", error);
            setService(null);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const formatAddress = (address: any) => {
        return `${address.address}, ${address.city}, ${address.state} ${address.zip_code}`;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'Concluído';
            case 'pending': return 'Pendente';
            case 'cancelled': return 'Cancelado';
            case 'in_progress': return 'Em Andamento';
            default: return 'Desconhecido';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Spinner size="lg" />
                <p className="text-gray-600">Carregando detalhes do serviço...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-lg font-semibold text-red-600">Erro</p>
                <p className="text-gray-600">Não foi possível carregar os detalhes do serviço.</p>
                <Button onPress={() => router.back()} color="primary">Voltar</Button>
            </div>
        );
    }

    return (
        <section className="p-6 md:p-10 max-w-7xl mx-auto h-screen overflow-auto scrollbar-none">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{service.name}</h1>
                <div className="mt-2">
                    <Chip color={getStatusColor(service.status)} variant="flat">
                        {getStatusLabel(service.status)}
                    </Chip>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Service Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-800">Informações do Serviço</h2>
                    </CardHeader>
                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Serviço"
                            value={service.name}
                            readOnly
                            description="Nome do serviço realizado"
                        />
                        <Input
                            label="Preço"
                            value={formatPrice(service.price)}
                            readOnly
                            description="Valor total do serviço"
                        />
                        <Input
                            label="Duração"
                            value={service.duration}
                            readOnly
                            description="Tempo estimado"
                        />
                        <Input
                            label="Tipo"
                            value={service.service_type}
                            readOnly
                            description="Categoria do serviço"
                        />
                        <Textarea
                            label="Descrição"
                            value={service.description}
                            readOnly
                            description="Detalhes do serviço realizado"
                            className="md:col-span-2"
                        />
                    </CardBody>
                </Card>

                {/* Client Information */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-800">Informações do Cliente</h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <Input
                            label="Nome"
                            value={service.client.name}
                            readOnly
                            description="Nome do cliente"
                        />
                        <Input
                            label="Email"
                            value={service.client.email}
                            readOnly
                            description="Email de contato"
                        />
                        <Input
                            label="Telefone"
                            value={service.client.phone}
                            readOnly
                            description="Número de telefone"
                        />
                        <Input
                            label="Endereço"
                            value={service.client.address}
                            readOnly
                            description="Endereço do cliente"
                        />
                    </CardBody>
                </Card>

                {/* Store Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-800">Informações da Loja</h2>
                    </CardHeader>
                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome"
                            value={service.store.name}
                            readOnly
                            description="Nome da loja"
                        />
                        <Input
                            label="Endereço"
                            value={formatAddress(service.store.adderess)}
                            readOnly
                            description="Localização da loja"
                        />
                    </CardBody>
                </Card>

                {/* Team Information */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-800">Informações da Equipe</h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <Input
                            label="Nome"
                            value={service.team.name}
                            readOnly
                            description="Nome da empresa"
                        />
                        <Input
                            label="Localização"
                            value={service.team.location}
                            readOnly
                            description="Localização da empresa"
                        />
                        {service.team.logo && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Logo da Empresa</p>
                                <Image
                                    className="max-w-[150px] max-h-[150px] rounded-md object-contain"
                                    src={service.team.logo}
                                    alt="Logo da empresa"
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Attachments */}
                {service.attachments?.length > 0 && (
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-gray-800">Anexos</h2>
                        </CardHeader>
                        <CardBody>
                            <Table removeWrapper aria-label="Tabela de anexos">
                                <TableHeader>
                                    <TableColumn>Visualização</TableColumn>
                                    <TableColumn>Tipo</TableColumn>
                                    <TableColumn align="end">Ações</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {service.attachments.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Image
                                                    className="max-w-[100px] max-h-[100px] rounded-md object-cover"
                                                    src={item.file}
                                                    alt={`Anexo ${index + 1}`}
                                                />
                                            </TableCell>
                                            <TableCell className="capitalize">{item.type}</TableCell>
                                            <TableCell >
                                                <Button
                                                    as="a"
                                                    href={item.file}
                                                    target="_blank"
                                                    color="primary"
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    Visualizar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                )}
            </div>
        </section>
    );
};

export default ServiceDetail;