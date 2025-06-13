import NewServiceForm from "@/components/forms/services/new";
import { useServices } from "@/contexts/services";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalContent,
    Pagination,
    Selection,
    SortDescriptor,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from "@heroui/react";
import React, { SVGProps, useState } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const PlusIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            >
                <path d="M6 12h12" />
                <path d="M12 18V6" />
            </g>
        </svg>
    );
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                fill="currentColor"
            />
        </svg>
    );
};

export const SearchIcon = (props: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
            <path
                d="M22 22L20 20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
        </svg>
    );
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...otherProps}
        >
            <path
                d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

// Use the shared Service type from your types directory
import type { Service } from "@/types/services";

const columns = [
    { name: "SERVIÇO", uid: "name", sortable: true },
    { name: "DESCRIÇÃO", uid: "description", sortable: true },
    { name: "PREÇO", uid: "price", sortable: true },
    { name: "DURAÇÃO", uid: "duration", sortable: true },
    { name: "LOJA", uid: "store", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "OPÇÕES", uid: "actions" },
];

export default function ServiceTable() {
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
        new Set(["name", "description", "price", "duration", "store", "status", "actions"])
    );
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = React.useState(1);
    const [error, setError] = useState<string | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { services, setSelectedService } = useServices();

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredServices = [...services];
        if (hasSearchFilter) {
            filteredServices = filteredServices.filter((service) =>
                service.name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return filteredServices;
    }, [services, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a: Service, b: Service) => {
            let first, second;
            if (sortDescriptor.column === "price") {
                first = a.price ?? 0;
                second = b.price ?? 0;
            } else if (sortDescriptor.column === "store") {
                first = a.stores?.name ?? "";
                second = b.stores?.name ?? "";
            } else if (sortDescriptor.column === "status") {
                first = a.status;
                second = b.status;
            } else {
                first = a[sortDescriptor.column as keyof Service] as string;
                second = b[sortDescriptor.column as keyof Service] as string;
            }
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = React.useCallback((service: Service, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-row gap-2 items-center w-full">
                        <p className="text-bold text-medium line-clamp-2 overflow-hidden text-ellipsis">
                            {service.name}
                        </p>
                    </div>
                );
            case "description":
                return (
                    <div className="flex flex-row gap-1 items-start w-full">
                        <p className="text-small text-default-400 line-clamp-3 overflow-hidden text-ellipsis">
                            {service.description ?? "N/A"}
                        </p>
                    </div>
                );
            case "price":
                return (
                    <p className="text-small">
                        {service.price
                            ? `R$ ${service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "N/A"}
                    </p>
                );
            case "duration":
                return (
                    <p className="text-small">
                        {service.duration ?? "N/A"}
                    </p>
                );
            case "store":
                return (
                    <p className="text-small">
                        {service.stores?.name ?? "N/A"}
                    </p>
                );
            case "status":
                return (
                    <p className="text-small capitalize">
                        {service.status === 'pending' ? 'Pendente' :
                            service.status === 'in_progress' ? 'Em Andamento' :
                                service.status === 'completed' ? 'Finalizado' :
                                    'Cancelado'}
                    </p>
                );
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <VerticalDotsIcon className="text-default-300" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem key="view" onPress={() => alert(`Visualizar ${service.id}`)}>
                                    Visualizar
                                </DropdownItem>
                                <DropdownItem key="edit" onPress={() => setSelectedService(service)}>
                                    Editar
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                const value = service[columnKey as keyof Service];
                return typeof value === "string" || typeof value === "number" ? value : "";
        }
    }, [setSelectedService]);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = React.useCallback((value?: string) => {
        setFilterValue(value ?? "");
        setPage(1);
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    const topContent = React.useMemo(() => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-3 items-end">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Pesquisar..."
                    startContent={<SearchIcon />}
                    value={filterValue}
                    onClear={onClear}
                    onValueChange={onSearchChange}
                />
                <div className="flex gap-3">
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                Colunas
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            selectedKeys={visibleColumns}
                            selectionMode="multiple"
                            onSelectionChange={setVisibleColumns}
                        >
                            {columns.map((column) => (
                                <DropdownItem key={column.uid} className="capitalize">
                                    {capitalize(column.name)}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Button color="primary" onPress={onOpen} endContent={<PlusIcon />}>
                        Adicionar
                    </Button>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-default-400 text-small">Total de serviços: {services.length}</span>
                <label className="flex items-center text-default-400 text-small">
                    Linhas por página:
                    <select
                        className="bg-transparent outline-none text-default-400 text-small"
                        onChange={onRowsPerPageChange}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                </label>
            </div>
        </div>
    ), [filterValue, visibleColumns, onSearchChange, onRowsPerPageChange, services.length, onOpen]);

    const bottomContent = React.useMemo(() => (
        <div className="py-2 px-2 flex justify-between items-center">
            <span className="w-[30%] text-small text-default-400">
                {selectedKeys === "all"
                    ? "Todos os itens selecionados"
                    : `${selectedKeys instanceof Set ? selectedKeys.size : 0} de ${filteredItems.length} selecionados`}
            </span>
            <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
            />
            <div className="hidden sm:flex w-[30%] justify-end gap-2">
                <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                    Voltar
                </Button>
                <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                    Próximo
                </Button>
            </div>
        </div>
    ), [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage]);

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
                <ModalContent>
                    {(onClose) => (
                        <div className="overflow-y-auto">
                            <NewServiceForm onClose={onClose} />
                        </div>
                    )}
                </ModalContent>
            </Modal>
            <Table
                isHeaderSticky
                aria-label="Tabela de serviços com células personalizadas, paginação e ordenação"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[382px]",
                }}
                selectedKeys={selectedKeys}
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"Nenhum serviço encontrado"} items={sortedItems}>
                    {(item) => (
                        <TableRow key={item.id} onClick={() => setSelectedService(item)}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}